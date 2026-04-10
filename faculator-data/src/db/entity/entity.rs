use sea_orm::entity::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "entity")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub entity_type: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub crafting_speed: Option<Decimal>,

    pub module_inventory_size: Option<u64>,

    pub energy_usage: Option<Decimal>,

    pub max_energy_usage: Option<Decimal>,

    pub max_energy_production: Option<Decimal>,

    pub max_power_output: Option<Decimal>,

    pub effectivity: Option<Decimal>,

    pub fluid_usage_per_tick: Option<Decimal>,

    pub maximum_temperature: Option<Decimal>,

    pub burns_fluid: Option<bool>,

    pub scale_fluid_usage: Option<bool>,

    pub destroy_non_fuel_fluid: Option<bool>,

    pub target_temperature: Option<Decimal>,

    pub boiler_mode: Option<String>,

    pub neighbour_bonus: Option<Decimal>,

    pub solar_panel_performance_at_day: Option<Decimal>,

    pub solar_panel_performance_at_night: Option<Decimal>,

    pub mining_speed: Option<Decimal>,

    pub mining_drill_radius: Option<Decimal>,

    pub researching_speed: Option<Decimal>,

    pub science_pack_drain_rate_percent: Option<Decimal>,

    pub distribution_effectivity: Option<Decimal>,

    pub distribution_effectivity_bonus_per_quality_level: Option<Decimal>,

    pub beacon_counter: Option<String>,

    pub supply_area_distance: Option<Decimal>,

    pub next_upgrade: Option<String>,

    pub quality_affects_module_slots: Option<bool>,
}

#[derive(Debug, Clone, Copy)]
#[derive(EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
