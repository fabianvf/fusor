import Ember from 'ember';
import NeedsDeploymentMixin from "../mixins/needs-deployment-mixin";

export default Ember.Controller.extend(NeedsDeploymentMixin, {

  rhevIsSelfHosted: Ember.computed.alias("deploymentController.model.rhev_is_self_hosted"),

  setupNextRouteName: Ember.computed('rhevIsSelfHosted', function(){
    if (this.get('rhevIsSelfHosted')) {
      return 'hypervisor.discovered-host';
    } else {
      return 'engine.discovered-host';
    }
  }),

  rhevSetup: Ember.computed('rhevIsSelfHosted', function() {
    return (this.get('rhevIsSelfHosted') ? "selfhost" : "rhevhost");
  }),

  rhevSetupTitle: Ember.computed('rhevIsSelfHosted', function() {
    return (this.get('rhevIsSelfHosted') ? "Self Hosted" : "Host + Engine");
  }),

  isSelfHosted: Ember.computed('rhevSetup', function() {
    return (this.get('rhevSetup') === 'selfhost');
  }),

  actions: {
    rhevSetupChanged() {
      var dc = this.get('deploymentController');
      dc.set('model.rhev_is_self_hosted', this.get('isSelfHosted'));
      // dc.set('model.discovered_host', null);
      // dc.set('model.discovered_hosts', []);
      // console.log(dc.get('mode.rhev_hypervisor_host_ids'));
      // console.log(dc.get('mode.rhev_engine_host_id'));
    }
  }

});
