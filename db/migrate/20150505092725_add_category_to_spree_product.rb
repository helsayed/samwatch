class AddCategoryToSpreeProduct < ActiveRecord::Migration
  def change
    add_column :spree_products, :category, :string
  end
end
