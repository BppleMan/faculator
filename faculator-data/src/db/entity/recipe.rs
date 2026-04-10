use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "recipe")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub category: String,

    pub energy: Decimal,

    pub main_product_type: Option<String>,

    pub main_product_name: Option<String>,

    pub enabled: bool,

    pub allow_decomposition: bool,

    pub allow_as_intermediate: bool,

    pub allow_intermediates: bool,

    pub always_show_made_in: bool,

    pub always_show_products: bool,

    pub show_amount_in_title: bool,

    pub emissions_multiplier: Decimal,

    pub maximum_productivity: Option<Decimal>,

    pub hide_from_player_crafting: Option<bool>,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
