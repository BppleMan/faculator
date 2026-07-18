use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "technology_prerequisite")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub technology_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub prerequisite_name: String,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
