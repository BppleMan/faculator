use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "technology_successor")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub technology_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub successor_name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
