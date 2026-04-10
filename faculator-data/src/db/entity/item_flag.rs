use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "item_flag")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub item_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub flag: String,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
