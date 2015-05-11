class AddItemIdToProducts < ActiveRecord::Migration
  def change
    add_column :spree_products, :item_id, :string
  end
end
