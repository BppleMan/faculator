use crate::{
    category::{ModuleCategory, RecipeCategory, ResourceCategory},
    concept::{EffectReceiver, EnergySource, FluidBoxPrototype, ItemStackDefinition, SurfaceCondition},
    material::ItemId,
};
use faculator_macros::ID;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 地图实体原型的稳定身份。
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct EntityId(String);

/// 一个地图实体原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Entity {
    pub name: EntityId,
    pub entity_type: String,
    pub order: String,
    pub hidden: bool,
    pub crafting_categories: Option<Vec<RecipeCategory>>,
    pub crafting_speed: Option<Decimal>,
    pub module_inventory_size: u64,
    pub allowed_effects: Option<Vec<String>>,
    pub allowed_module_categories: Option<Vec<ModuleCategory>>,
    pub effect_receiver: Option<EffectReceiver>,
    pub energy_usage: Option<Decimal>,
    pub max_energy_usage: Decimal,
    pub max_energy_production: Decimal,
    pub max_power_output: Option<Decimal>,
    pub effectivity: Option<Decimal>,
    pub energy_source: Option<EnergySource>,
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
    pub resource_categories: Option<Vec<ResourceCategory>>,
    pub lab_inputs: Option<Vec<ItemId>>,
    pub researching_speed: Option<Decimal>,
    pub science_pack_drain_rate_percent: Option<Decimal>,
    pub distribution_effectivity: Option<Decimal>,
    pub distribution_effectivity_bonus_per_quality_level: Option<Decimal>,
    pub beacon_profile: Option<Vec<Decimal>>,
    pub beacon_counter: Option<String>,
    pub supply_area_distance: Option<Decimal>,
    pub fluid_box_prototypes: Option<Vec<FluidBoxPrototype>>,
    pub next_upgrade: Option<EntityId>,
    pub quality_affects_module_slots: Option<bool>,
    pub surface_conditions: Option<Vec<SurfaceCondition>>,
    #[serde(default)]
    pub items_to_place_this: Vec<ItemStackDefinition>,
}
