use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "equipment_allowed_category")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub equipment_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub category_name: String,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
