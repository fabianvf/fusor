require 'test_plugin_helper'

module Actions::Fusor::Deployment::CloudForms
  class UpdateRootPasswordTest < FusorActionTest
    TriggerProvisioning = ::Actions::Fusor::Host::TriggerProvisioning
    WaitUntilProvisioned = ::Actions::Fusor::Host::WaitUntilProvisioned

    def setup
      @updatepw = create_action UpdateRootPassword
      @deployment = fusor_deployments(:rhev_and_cfme)
    end

    test "run" do
      run_action(plan_action(@updatepw, @deployments))
    end
  end
end
