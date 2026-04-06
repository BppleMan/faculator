use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "equipment_grid_allowed_category")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub equipment_grid_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub category_name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
