use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "entity_burner_fuel_category")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub entity_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub fuel_category_name: String,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
