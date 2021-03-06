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
    module Deployment
      module CloudForms
        class AddOseProvider < Actions::Fusor::FusorBaseAction
          def humanized_name
            _("Add Ose Provider")
          end

          def plan(deployment)
            super(deployment)
            plan_self(deployment_id: deployment.id)
          end

          def run
            ::Fusor.log.debug "================ AddOseProvider run method ===================="

            deployment = ::Fusor::Deployment.find(input[:deployment_id])
            cfme_addresses = [deployment.cfme_rhv_address, deployment.cfme_osp_address].compact
            deployment.ose_master_hosts.each_with_index do |master, index|
              token = File.read("#{Rails.root}/tmp/#{deployment.label}/#{master}.token")
              provider = {
                :name => "#{deployment.label}-OSE-#{index}",
                :type => "ManageIQ::Providers::Openshift::ContainerManager",
                :hostname => master.ip,
                :port => "8443",
                :credentials => {
                  :auth_type => "bearer",
                  :auth_key => token
                }
              }

              ::Fusor.log.info "Adding OSE provider #{provider[:name]} to CFME."

              cfme_addresses.each do |cfme_address|
                Utils::CloudForms::AddProvider.add(cfme_address, provider, deployment)
                Utils::CloudForms::AddCredentialsForHosts.add(cfme_address, deployment)
              end
            end


            ::Fusor.log.debug "================ Leaving AddOseProvider run method ===================="
          end
        end
      end
    end
  end
end
