use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "entity_allowed_effect")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub entity_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub effect_type: String,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
