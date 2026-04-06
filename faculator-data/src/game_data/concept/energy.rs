//! 能源相关嵌套 DTO。
//!
//! `Entity.energy_sources` 是导出里最典型的“组件化设计”之一：
//!
//! - 一个实体会带一个 `types` 列表，指出它拥有哪些能源源类型
//! - 同一个对象里再挂载 `burner / electric / fluid / heat / void` 等具体子原型
//!
//! 这意味着 source DTO 需要保留这种嵌套形状，而数据库层大概率要拆成主表 + 若干子表。
//! 例如 `energy_sources.burner` 表示“实体拥有燃烧器能力”，它不是独立实体，也不是顶层原型集合，
//! 更合理的持久化方式是建成 `entity_burner_energy_source` 之类的子表，用 `entity_id` / `entity_name`
//! 指回宿主实体，而不是把 burner 本身建成一张独立主表。
//!
//! 此外，`ElectricEnergySource.input_flow_limit` / `output_flow_limit` 不能简单用 `Decimal`，
//! 因为导出可能使用 `DBL_MAX` 作为“无限流量”的哨兵。
mod electric_usage_priority;

pub use electric_usage_priority::*;

use crate::game_data::category::FuelCategory;
use crate::game_data::concept::{FluidBoxPrototype, HeatBufferPrototype};
use crate::string_enum;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde_json::Number;
use std::collections::BTreeMap;

/// 单位能量对应的排放映射。
///
/// key 通常是污染类别名称，value 是对应的排放量。
pub type EmissionsPerJoule = BTreeMap<String, Decimal>;

string_enum! {
    /// energy_sources.types 中记录的能源类型标签。
    pub enum EnergySourceType {
        /// 燃烧能源源。
        ///
        /// 对应 `energy_sources.burner` 子对象。
        Burner => "burner",

        /// 电力能源源。
        ///
        /// 对应 `energy_sources.electric` 子对象。
        Electric => "electric",

        /// 流体能源源。
        ///
        /// 对应 `energy_sources.fluid` 子对象。
        Fluid => "fluid",

        /// 热能能源源。
        ///
        /// 对应 `energy_sources.heat` 子对象。
        Heat => "heat",

        /// 虚空能源源。
        ///
        /// 对应 `energy_sources.void` 子对象。
        Void => "void"
    }
}

/// 燃烧能源源定义。
///
/// 这是“实体附带的燃烧器能力”的直接承载对象。
/// 它本质上是 `Entity` 的一个组件，而不是独立实体，因此更适合持久化成
/// `entity -> burner_energy_source` 的一对一子表。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BurnerEnergySource {
    /// 燃烧效率。
    pub effectivity: Decimal,

    /// 燃料槽数量。
    pub fuel_inventory_size: u64,

    /// 燃尽产物槽数量。
    pub burnt_inventory_size: u64,

    /// 接受的燃料类别列表。
    ///
    /// 这些值会引用顶层 `fuel_categories`。
    pub fuel_categories: Vec<FuelCategory>,

    /// 初始燃料名称。
    ///
    /// 当存在时，通常会引用 `items.name` 或 `fluids.name`。
    pub initial_fuel: Option<String>,

    /// 初始燃料填充比例。
    pub initial_fuel_percent: Option<Decimal>,

    /// 每焦耳排放映射。
    pub emissions_per_joule: Option<EmissionsPerJoule>,

    /// 是否在无网络时显示图标。
    pub render_no_network_icon: bool,

    /// 是否在无电时显示图标。
    pub render_no_power_icon: bool,
}

/// 电力能源源定义。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ElectricEnergySource {
    /// 缓冲容量。
    pub buffer_capacity: Decimal,

    /// 用电优先级。
    ///
    /// 该字段决定实体在电网中的供能 / 放电调度策略。
    pub usage_priority: ElectricUsagePriority,

    /// 待机漏电量。
    pub drain: Decimal,

    /// 输入流量上限。
    ///
    /// 使用 `Number` 是为了容纳导出中的超大哨兵值。
    pub input_flow_limit: Option<Number>,

    /// 输出流量上限。
    ///
    /// 使用 `Number` 是为了容纳导出中的超大哨兵值。
    pub output_flow_limit: Option<Number>,

    /// 每焦耳排放映射。
    pub emissions_per_joule: Option<EmissionsPerJoule>,

    /// 是否在无网络时显示图标。
    pub render_no_network_icon: bool,

    /// 是否在无电时显示图标。
    pub render_no_power_icon: bool,
}

/// 流体能源源定义。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FluidEnergySource {
    /// 能源转换效率。
    pub effectivity: Decimal,

    /// 是否直接燃烧流体。
    pub burns_fluid: bool,

    /// 是否按负载缩放用量。
    pub scale_fluid_usage: bool,

    /// 是否销毁非燃料流体。
    pub destroy_non_fuel_fluid: bool,

    /// 每 tick 流体消耗量。
    pub fluid_usage_per_tick: Decimal,

    /// 最大允许温度。
    pub maximum_temperature: Decimal,

    /// 绑定的流体箱定义。
    pub fluid_box: Option<FluidBoxPrototype>,

    /// 每焦耳排放映射。
    pub emissions_per_joule: Option<EmissionsPerJoule>,

    /// 是否在无网络时显示图标。
    pub render_no_network_icon: bool,

    /// 是否在无电时显示图标。
    pub render_no_power_icon: bool,
}

/// 热能能源源定义。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HeatEnergySource {
    /// 最高温度。
    pub max_temperature: Decimal,

    /// 默认温度。
    pub default_temperature: Decimal,

    /// 比热。
    pub specific_heat: Decimal,

    /// 最大传热率。
    pub max_transfer: Decimal,

    /// 最小温度梯度。
    pub min_temperature_gradient: Decimal,

    /// 最小工作温度。
    pub min_working_temperature: Decimal,

    /// 最低发光温度。
    pub minimum_glow_temperature: Decimal,

    /// 热缓冲区定义。
    pub heat_buffer: Option<HeatBufferPrototype>,

    /// 每焦耳排放映射。
    pub emissions_per_joule: Option<EmissionsPerJoule>,

    /// 是否在无网络时显示图标。
    pub render_no_network_icon: bool,

    /// 是否在无电时显示图标。
    pub render_no_power_icon: bool,
}

/// 虚空能源源定义。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct VoidEnergySource {
    /// 每焦耳排放映射。
    pub emissions_per_joule: Option<EmissionsPerJoule>,

    /// 是否在无网络时显示图标。
    pub render_no_network_icon: bool,

    /// 是否在无电时显示图标。
    pub render_no_power_icon: bool,
}

/// 一个实体挂载的能源源集合。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EnergySources {
    /// 当前实体拥有的能源源类型列表。
    ///
    /// 该字段决定下面哪些具体子对象应当存在。
    pub types: Vec<EnergySourceType>,

    /// 燃烧能源源子对象。
    pub burner: Option<BurnerEnergySource>,

    /// 电力能源源子对象。
    pub electric: Option<ElectricEnergySource>,

    /// 流体能源源子对象。
    pub fluid: Option<FluidEnergySource>,

    /// 热能能源源子对象。
    pub heat: Option<HeatEnergySource>,

    /// 虚空能源源子对象。
    pub void: Option<VoidEnergySource>,

    /// 顶层热缓冲区定义。
    ///
    /// 该字段直接挂在 `energy_sources` 上，是导出 API 的原始设计之一。
    pub heat_buffer: Option<HeatBufferPrototype>,
}
