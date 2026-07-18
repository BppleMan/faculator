use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "entity_burner_energy_source")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub entity_name: String,

    pub effectivity: Decimal,

    pub fuel_inventory_size: u64,

    pub burnt_inventory_size: u64,

    pub initial_fuel: Option<String>,

    pub initial_fuel_percent: Option<Decimal>,

    pub emissions_per_joule: Option<Json>,

    pub render_no_network_icon: bool,

    pub render_no_power_icon: bool,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
