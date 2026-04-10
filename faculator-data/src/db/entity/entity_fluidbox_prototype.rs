use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "entity_fluidbox_prototype")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub entity_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub sort_index: u64,

    pub production_type: String,

    pub filter_fluid_name: Option<String>,

    pub minimum_temperature: Option<Decimal>,

    pub maximum_temperature: Option<Decimal>,

    pub base_area: Decimal,

    pub base_level: Decimal,

    pub volume: Option<Decimal>,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
