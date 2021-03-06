import Ember from 'ember';
import NeedsDeploymentMixin from "../mixins/needs-deployment-mixin";
import { Validator, EqualityValidator, LengthValidator, RequiredPasswordValidator, AlphaNumericDashUnderscoreValidator, AllValidator } from '../utils/validators';

export default Ember.Controller.extend(NeedsDeploymentMixin, {

  rhevRootPassword: Ember.computed.alias("deploymentController.model.rhev_root_password"),
  rhevEngineAdminPassword: Ember.computed.alias("deploymentController.model.rhev_engine_admin_password"),
  rhevDataCenterName: Ember.computed.alias("deploymentController.model.rhev_data_center_name"),
  rhevClusterName: Ember.computed.alias("deploymentController.model.rhev_cluster_name"),
  rhevCpuType: Ember.computed.alias("deploymentController.model.rhev_cpu_type"),
  confirmRhevRootPassword: Ember.computed.alias("deploymentController.confirmRhevRootPassword"),
  confirmRhevEngineAdminPassword: Ember.computed.alias("deploymentController.confirmRhevEngineAdminPassword"),

  cpuTypes: Ember.computed('model.cpu_families', function() {
    return this.get('model.cpu_families');
  }),
  defaultCpuFamily: Ember.computed('model.default_family', function() {
    return this.get('model.default_family');
  }),

  passwordValidator: RequiredPasswordValidator.create({}),

  confirmRhevRootPasswordValidator: Ember.computed('rhevRootPassword', function() {
    return EqualityValidator.create({equals: this.get('rhevRootPassword')});
  }),

  confirmRhevEngineAdminPasswordValidator: Ember.computed('rhevEngineAdminPassword', function() {
    return EqualityValidator.create({equals: this.get('rhevEngineAdminPassword')});
  }),

  optionsBackRouteName: 'hypervisor.discovered-host',

  applicationModes: ['Both', 'Virt', 'Gluster'],
  engineLocation: ['Local', 'Remote'],
  dbSetup: ['Automatic', 'Manual'],
  yesNo: ['Yes', 'No'],
  applicationModes2: [
    {
      id: 1,
      name: 'Both'
    },
    {
      id: 2,
      name: 'Virt'
    },
    {
      id: 3,
      name: 'Gluster'
    }
  ],

  createComputerNameValidator(fieldName, otherFieldName, otherFieldValue) {
    if (Ember.isBlank(otherFieldValue) || otherFieldValue === 'Default') {
      return AllValidator.create({
        validators: [
          AlphaNumericDashUnderscoreValidator.create({trim: false}),
          LengthValidator.create({max: 40})
        ]
      });
    }

    return AllValidator.create({
      validators: [
        Validator.create({
          message: `Note: You must change the ${fieldName} after changing the ${otherFieldName}`,
          isValid(value) {
            return Ember.isPresent(value) && value !== 'Default';
          }
        }),
        AlphaNumericDashUnderscoreValidator.create({trim: false}),
        LengthValidator.create({max: 40})
      ]
    });
  },

  dataCenterNameValidator: Ember.computed('rhevClusterName', function() {
    return this.createComputerNameValidator('data center name', 'cluster name', this.get('rhevClusterName'));
  }),

  clusterNameValidator: Ember.computed('rhevDataCenterName', function () {
    return this.createComputerNameValidator('cluster name', 'data center name', this.get('rhevDataCenterName'));
  }),

  validRhevOptions: Ember.computed(
    'rhevRootPassword',
    'confirmRhevRootPassword',
    'confirmRhevRootPasswordValidator',
    'rhevEngineAdminPassword',
    'confirmRhevEngineAdminPassword',
    'confirmRhevEngineAdminPasswordValidator',
    'rhevDataCenterName',
    'dataCenterNameValidator',
    'rhevClusterName',
    'clusterNameValidator',
    function () {
      return this.get('passwordValidator').isValid(this.get('rhevRootPassword')) &&
        this.get('passwordValidator').isValid(this.get('rhevEngineAdminPassword')) &&
        this.get('confirmRhevRootPasswordValidator').isValid(this.get('confirmRhevRootPassword')) &&
        this.get('confirmRhevEngineAdminPasswordValidator').isValid(this.get('confirmRhevEngineAdminPassword')) &&
        this.get('dataCenterNameValidator').isValid(this.get('rhevDataCenterName')) &&
        this.get('clusterNameValidator').isValid(this.get('rhevClusterName'));
    }),

  disableNextRhevOptions: Ember.computed.not('validRhevOptions'),

  isDCConfigDisabled: Ember.computed('rhevIsSelfHosted', 'isStarted', function(){
    // Temporarily disable custom data center configuration for QCI v1.1 release (BZ 1413194)
    // Will need to revert this change for QCI v1.2 (BZ 1413189)
    //
    // return this.get('isStarted') || this.get('rhevIsSelfHosted');
    return true;
  }),

  actions: {
    setSelectValue(fieldName, selectionValue) {
      this.set(fieldName, selectionValue);
    }
  }
});
