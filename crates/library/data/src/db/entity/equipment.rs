use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "equipment")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub equipment_type: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub energy_production: Decimal,

    pub energy_per_shield: u64,

    pub shape_width: u64,

    pub shape_height: u64,

    pub take_result: Option<String>,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
