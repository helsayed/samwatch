class AddFildsToProducts < ActiveRecord::Migration
  def change
    add_column :spree_products, :image_url, :string
    add_column :spree_products, :brand, :string
  end
end
