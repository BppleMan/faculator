use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "item")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub item_type: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub stack_size: u64,

    pub weight: Decimal,

    pub default_import_location: String,

    pub fuel_value: u64,

    pub fuel_acceleration_multiplier: Decimal,

    pub fuel_top_speed_multiplier: Decimal,

    pub fuel_emissions_multiplier: u64,

    pub fuel_category: Option<String>,

    pub module_category: Option<String>,

    pub tier: Option<u64>,

    pub place_result: Option<String>,

    pub place_as_equipment_result: Option<String>,

    pub spoil_result: Option<String>,

    pub burnt_result: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
