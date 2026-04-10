use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "active_mod")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub game_mods_hash: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub version: String,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
