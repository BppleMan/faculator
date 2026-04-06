use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "recipe_surface_condition")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub recipe_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub sort_index: u64,

    pub property: String,

    pub min_value: String,

    pub max_value: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
