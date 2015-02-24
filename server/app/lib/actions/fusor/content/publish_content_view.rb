#
# Copyright 2015 Red Hat, Inc.
#
# This software is licensed to you under the GNU General Public
# License as published by the Free Software Foundation; either version
# 2 of the License (GPLv2) or (at your option) any later version.
# There is NO WARRANTY for this software, express or implied,
# including the implied warranties of MERCHANTABILITY,
# NON-INFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. You should
# have received a copy of GPLv2 along with this software; if not, see
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.

module Actions
  module Fusor
    module Content
      class PublishContentView < Actions::Base
        def humanized_name
          _("Publish Content View")
        end

        def plan(deployment, repositories)
          # TODO: Update the organization & environment to use the deployment object
          organization = ::Organization.all.first
          lifecycle_environment = ::Katello::KTEnvironment.where(:name => "dev").first

          sequence do
            composite_view = find_or_create_content_view(organization,
                                                         SETTINGS[:fusor][:content][:content_view][:composite_view_name],
                                                         true)

            rpm_view = find_or_create_content_view(organization,
                                                   SETTINGS[:fusor][:content][:content_view][:rpm_component_view_name])
            repo_ids = repositories.map(&:id)
            unless rpm_view.repository_ids == repo_ids
              plan_action(::Actions::Katello::ContentView::Update, rpm_view, :repository_ids => repo_ids)
              plan_action(::Actions::Katello::ContentView::Publish, rpm_view)
            end
            rpm_view_version = rpm_view.version(organization.library)

            #The puppet view is created during the seeding of the plugin; therefore, we should not need to create it
            puppet_view = find_content_view(organization,
                                            SETTINGS[:fusor][:content][:content_view][:puppet_component_view_name])
            puppet_view_version = puppet_view.version(organization.library)

            component_version_ids = [rpm_view_version.id, puppet_view_version.id]
            unless composite_view.component_ids == component_version_ids
              plan_action(::Actions::Katello::ContentView::Update, composite_view, :component_ids => component_version_ids)
              plan_action(::Actions::Katello::ContentView::Publish, composite_view)
            end

            # Promote content view to target lifecycle environment (Note: if the target env is library, no need to promote...)
            unless lifecycle_environment.library?
              plan_action(::Actions::Katello::ContentView::Promote, composite_view.version(organization.library), lifecycle_environment)
            end
          end
        end

        private

        def find_or_create_content_view(organization, view_name, composite = false)
          if view_name
            unless view = find_content_view(organization, view_name)
              view = ::Katello::ContentView.create!(:organization_id => organization.id,
                                                    :name => view_name,
                                                    :composite => composite)
            end
          end
          view
        end

        def find_content_view(organization, view_name)
          ::Katello::ContentView.where(:organization_id => organization.id, :name => view_name).first
        end
      end
    end
  end
end