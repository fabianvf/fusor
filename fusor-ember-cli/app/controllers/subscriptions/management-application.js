import Ember from 'ember';

export default Ember.Controller.extend({

  needs: ['subscriptions'],

  sessionPortal: Ember.computed.alias('controllers.subscriptions.model'),

  showAlertMessage: false,

  actions: {
    selectManagementApp: function(managementApp) {
      this.set('showAlertMessage', false);
      this.get('sessionPortal').set('consumerUUID', managementApp.uuid);
      this.get('sessionPortal').save();
    },

    createSatellite: function(params) {
      var token = $('meta[name="csrf-token"]').attr('content');
      var newSatelliteName = this.get('newSatelliteName');
      var ownerKey = this.get('sessionPortal').get('ownerKey');
      var self = this;

      //POST /customer_portal/consumers?owner=#{OWNER['key']}, {"name":"#{RHCI_DISTRIBUTOR_NAME}","type":"satellite","facts":{"distributor_version":"sat-6.0","system.certificate_version":"3.2"}}
      var url = ('/customer_portal/consumers?=' + ownerKey);

      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.$.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({name: newSatelliteName,
                                  type: "satellite",
                                  facts: {"distributor_version": "sat-6.0", "system.certificate_version": "3.2"}} ),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
            },
            success: function(response) {
              self.get('model').pushObject(response);
              self.get('sessionPortal').set('consumerUUID', response.uuid);
              self.get('sessionPortal').save();
              self.set('showAlertMessage', true);
              console.log(response);
              resolve(response);
            },
            error: function(response){
              console.log('error on createSatellite');
              return self.send('error');
            }
        });
      });
    }

  },

});
