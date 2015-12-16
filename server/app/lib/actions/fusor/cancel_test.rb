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
    class CancelTest < Actions::Fusor::FusorEntryAction
      include ::Dynflow::Action::Cancellable

      def humanized_name
        _("Cancel Test")
      end

      def plan
        plan_self
      end

      def run(event = nil)
        Rails.logger.warn "XXX --------------- Entered run ---------------"
        Rails.logger.warn "XXX Event is #{event}"
        i = 0
        num = 1000
        while (i < num) && (event != Dynflow::Action::Cancellable::Cancel) do
          Rails.logger.warn "XXX #{i} still haven't been canceled."
          sleep 2
          i += 1
        end
        Rails.logger.warn "XXX --------------- Leaving run, i is #{i} ---------------"
      end

      def cancel!
        Rails.logger.warn "XXX --------------- Entered cancel ---------------"
        Rails.logger.warn "XXX --------------- Leaving cancel ---------------"
      end
    end
  end
end
