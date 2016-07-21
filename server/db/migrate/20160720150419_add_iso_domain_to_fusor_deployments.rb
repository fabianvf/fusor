class AddIsoDomainToFusorDeployments < ActiveRecord::Migration
  def change
    add_column :fusor_deployments, :rhev_iso_domain_name, :string
    add_column :fusor_deployments, :rhev_iso_domain_address, :string
    add_column :fusor_deployments, :rhev_iso_domain_path, :string
    add_column :fusor_deployments, :rhev_config_iso_domain, :bool
  end
end
