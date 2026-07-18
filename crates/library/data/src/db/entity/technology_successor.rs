use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "technology_successor")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub technology_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub successor_name: String,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
