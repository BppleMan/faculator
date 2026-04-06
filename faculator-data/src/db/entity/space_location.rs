use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "space_location")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub solar_power_in_space: u64,

    pub position_x: Decimal,

    pub position_y: Decimal,

    pub day_night_cycle: Option<u64>,

    pub magnetic_field: Option<u64>,

    pub solar_power: Option<u64>,

    pub pressure: Option<u64>,

    pub gravity: Option<u64>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
