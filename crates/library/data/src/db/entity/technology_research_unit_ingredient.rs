use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "technology_research_unit_ingredient")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub technology_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub sort_index: u64,

    pub item_name: String,

    pub amount: Decimal,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
