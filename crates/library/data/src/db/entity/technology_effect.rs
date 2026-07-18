use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "technology_effect")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub technology_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub sort_index: u64,

    pub effect_type: String,

    pub modifier_boolean: Option<bool>,

    pub modifier_integer: Option<i64>,

    pub modifier_decimal: Option<Decimal>,

    pub recipe_name: Option<String>,

    pub space_location_name: Option<String>,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
