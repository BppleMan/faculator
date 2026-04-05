mod entity_type;

use crate::concept::{EffectReceiver, EnergySources, FluidBoxPrototype, ItemStackDefinition, SurfaceCondition};
pub use entity_type::*;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Entity {
    pub name: String,
    #[serde(rename = "type")]
    pub entity_type: EntityType,
    pub group: String,
    pub subgroup: String,
    /// 排序键
    pub order: String,
    pub hidden: bool,

    /// 配方工厂字段（组装机、熔炉、火箭发射井）
    pub crafting_categories: Option<Vec<String>>,
    pub crafting_speed: Option<Decimal>,
    pub module_inventory_size: Option<u64>,
    pub allowed_effects: Option<Vec<String>>,
    pub allowed_module_categories: Option<Vec<String>>,
    pub effect_receiver: Option<EffectReceiver>,

    /// 能源相关
    pub energy_usage: Option<Decimal>,
    pub max_energy_usage: Option<Decimal>,
    pub max_energy_production: Option<Decimal>,
    pub max_power_output: Option<Decimal>,
    pub effectivity: Option<Decimal>,
    pub energy_sources: Option<EnergySources>,

    /// 流体处理（锅炉、流体能源发电机）
    pub fluid_usage_per_tick: Option<Decimal>,
    pub maximum_temperature: Option<Decimal>,
    pub burns_fluid: Option<bool>,
    pub scale_fluid_usage: Option<bool>,
    pub destroy_non_fuel_fluid: Option<bool>,
    pub target_temperature: Option<Decimal>,
    pub boiler_mode: Option<BoilerMode>,

    /// 核反应堆
    pub neighbour_bonus: Option<Decimal>,

    /// 太阳能板
    pub solar_panel_performance_at_day: Option<Decimal>,
    pub solar_panel_performance_at_night: Option<Decimal>,

    /// 采矿机
    pub mining_speed: Option<Decimal>,
    pub mining_drill_radius: Option<Decimal>,
    pub resource_categories: Option<Vec<String>>,

    /// 实验室
    pub lab_inputs: Option<Vec<String>>,
    pub researching_speed: Option<Decimal>,
    pub science_pack_drain_rate_percent: Option<Decimal>,

    /// 效果分享塔
    pub distribution_effectivity: Option<Decimal>,
    pub distribution_effectivity_bonus_per_quality_level: Option<Decimal>,
    /// 效果分享塔强度曲线（与品质等级对应的倍率列表）
    pub beacon_profile: Option<Vec<Decimal>>,
    pub beacon_counter: Option<BeaconCounter>,
    pub supply_area_distance: Option<Decimal>,

    /// 流体箱原型列表
    pub fluidbox_prototypes: Option<Vec<FluidBoxPrototype>>,

    /// 通用字段
    pub next_upgrade: Option<String>,
    pub quality_affects_module_slots: Option<bool>,
    pub surface_conditions: Option<Vec<SurfaceCondition>>,
    pub items_to_place_this: Option<Vec<ItemStackDefinition>>,
}

impl PartialOrd for Entity {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Entity {
    fn cmp(&self, other: &Self) -> Ordering {
        self.order.cmp(&other.order).then(self.name.cmp(&other.name))
    }
}
