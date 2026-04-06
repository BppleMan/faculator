use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "fluid")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub default_temperature: Decimal,

    pub max_temperature: Decimal,

    pub heat_capacity: Decimal,

    pub fuel_value: Option<u64>,

    pub emissions_multiplier: Option<Decimal>,

    pub gas_temperature: Option<String>,

    pub base_color_r: Option<Decimal>,

    pub base_color_g: Option<Decimal>,

    pub base_color_b: Option<Decimal>,

    pub base_color_a: Option<Decimal>,

    pub flow_color_r: Option<Decimal>,

    pub flow_color_g: Option<Decimal>,

    pub flow_color_b: Option<Decimal>,

    pub flow_color_a: Option<Decimal>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
