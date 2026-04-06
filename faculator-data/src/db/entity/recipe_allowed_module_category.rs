use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "recipe_allowed_module_category")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub recipe_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub module_category_name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
