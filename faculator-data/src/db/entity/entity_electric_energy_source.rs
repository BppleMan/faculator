use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "entity_electric_energy_source")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub entity_name: String,

    pub buffer_capacity: Decimal,

    pub usage_priority: String,

    pub drain: Decimal,

    pub input_flow_limit: Option<String>,

    pub output_flow_limit: Option<String>,

    pub emissions_per_joule: Option<Json>,

    pub render_no_network_icon: bool,

    pub render_no_power_icon: bool,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
