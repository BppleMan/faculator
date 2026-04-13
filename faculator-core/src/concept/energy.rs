use crate::{
    category::FuelCategory,
    concept::{FluidBoxPrototype, HeatBufferPrototype, MaterialId, Number},
};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

pub type EmissionsPerJoule = BTreeMap<String, Decimal>;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct BurnerEnergySource {
    pub effectivity: Decimal,
    pub fuel_inventory_size: u64,
    pub burnt_inventory_size: u64,
    pub fuel_categories: Vec<FuelCategory>,
    pub initial_fuel: Option<MaterialId>,
    pub initial_fuel_percent: Option<Decimal>,
    pub emissions_per_joule: Option<EmissionsPerJoule>,
    pub render_no_network_icon: bool,
    pub render_no_power_icon: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ElectricEnergySource {
    pub buffer_capacity: Decimal,
    pub usage_priority: String,
    pub drain: Decimal,
    pub input_flow_limit: Option<Number>,
    pub output_flow_limit: Option<Number>,
    pub emissions_per_joule: Option<EmissionsPerJoule>,
    pub render_no_network_icon: bool,
    pub render_no_power_icon: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct FluidEnergySource {
    pub effectivity: Decimal,
    pub burns_fluid: bool,
    pub scale_fluid_usage: bool,
    pub destroy_non_fuel_fluid: bool,
    pub fluid_usage_per_tick: Decimal,
    pub maximum_temperature: Decimal,
    pub fluid_box: Option<FluidBoxPrototype>,
    pub emissions_per_joule: Option<EmissionsPerJoule>,
    pub render_no_network_icon: bool,
    pub render_no_power_icon: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct HeatEnergySource {
    pub max_temperature: Decimal,
    pub default_temperature: Decimal,
    pub specific_heat: Decimal,
    pub max_transfer: Decimal,
    pub min_temperature_gradient: Decimal,
    pub min_working_temperature: Decimal,
    pub minimum_glow_temperature: Decimal,
    pub heat_buffer: Option<HeatBufferPrototype>,
    pub emissions_per_joule: Option<EmissionsPerJoule>,
    pub render_no_network_icon: bool,
    pub render_no_power_icon: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct VoidEnergySource {
    pub emissions_per_joule: Option<EmissionsPerJoule>,
    pub render_no_network_icon: bool,
    pub render_no_power_icon: bool,
}

/// 一个实体挂载的能源源定义。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct EnergySource {
    pub types: Vec<String>,
    pub burner: Option<BurnerEnergySource>,
    pub electric: Option<ElectricEnergySource>,
    pub fluid: Option<FluidEnergySource>,
    pub heat: Option<HeatEnergySource>,
    pub void: Option<VoidEnergySource>,
    pub heat_buffer: Option<HeatBufferPrototype>,
}
