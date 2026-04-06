use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "recipe_product")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub recipe_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub sort_index: u64,

    pub material_type: String,

    pub material_name: String,

    pub amount: Option<Decimal>,

    pub amount_min: Option<Decimal>,

    pub amount_max: Option<Decimal>,

    pub probability: Option<Decimal>,

    pub temperature: Option<Decimal>,

    pub catalyst_amount: Option<Decimal>,

    pub percent_spoiled: Option<Decimal>,

    pub ignored_by_stats: Option<Decimal>,

    pub ignored_by_productivity: Option<Decimal>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
