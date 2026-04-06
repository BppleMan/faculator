use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "item_flag")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub item_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub flag: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
