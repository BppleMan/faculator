use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "space_connection")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub from_location: String,

    pub to_location: String,

    pub length: u64,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
