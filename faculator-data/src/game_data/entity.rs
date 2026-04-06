//! `entities` 集合中的 DTO。
//!
//! `Entity` 表示地图上的实体原型，而不是背包里的物品原型。
//! 这个对象天生带有大量“能力组件”字段，因此是 source DTO 中最宽的一类记录。
//!
//! 几条尤其重要的关联线索：
//!
//! - `name` 是实体主键
//! - `items_to_place_this[].name -> items.name`
//! - `next_upgrade -> entities.name`
//! - `crafting_categories[] -> recipe_categories.name`
//! - `resource_categories[] -> resource_categories.name`
//! - `allowed_module_categories[] -> module_categories.name`
//! - `lab_inputs[] -> items.name`
//!
//! 这些字段基本都会直接变成后续 SQL 模型里的关联表来源。
mod entity_type;

use crate::game_data::category::{ModuleCategory, RecipeCategory, ResourceCategory};
use crate::game_data::concept::{
    EffectReceiver, EnergySources, FluidBoxPrototype, ItemStackDefinition, ModuleEffectType, SurfaceCondition,
};
pub use entity_type::*;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

/// 一个可导出的地图实体原型。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Entity {
    /// 实体名称。
    ///
    /// 这是实体表的自然主键，也是放置关系、升级关系等多条关联的目标键。
    pub name: String,

    /// 实体原型类型。
    ///
    /// 原始 JSON 使用 `type` 键；这里映射为 `entity_type`。
    #[serde(rename = "type")]
    pub entity_type: EntityType,

    /// 所属展示大分组名称。
    pub group: String,

    /// 所属展示子分组名称。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 该实体支持的配方类别列表。
    ///
    /// 这些值会引用顶层 `recipe_categories`，是实体与配方兼容性关系的关键外键。
    pub crafting_categories: Option<Vec<RecipeCategory>>,

    /// 制作速度。
    pub crafting_speed: Option<Decimal>,

    /// 模块槽数量。
    pub module_inventory_size: Option<u64>,

    /// 允许接收的效果类型列表。
    ///
    /// 这些值定义机器允许哪些模块效果真正进入运算规则。
    pub allowed_effects: Option<Vec<ModuleEffectType>>,

    /// 允许插入的模块类别列表。
    ///
    /// 这些值会引用顶层 `module_categories`。
    pub allowed_module_categories: Option<Vec<ModuleCategory>>,

    /// 效果接收器定义。
    pub effect_receiver: Option<EffectReceiver>,

    /// 标称能耗。
    pub energy_usage: Option<Decimal>,

    /// 最大输入能耗。
    pub max_energy_usage: Option<Decimal>,

    /// 最大发电量。
    pub max_energy_production: Option<Decimal>,

    /// 最大输出功率。
    pub max_power_output: Option<Decimal>,

    /// 能效倍率。
    pub effectivity: Option<Decimal>,

    /// 能源源定义。
    ///
    /// 这是能源系统的核心嵌套组件，后续入库时通常会拆成主表 + 子表。
    pub energy_sources: Option<EnergySources>,

    /// 每 tick 消耗的流体量。
    pub fluid_usage_per_tick: Option<Decimal>,

    /// 最大流体温度。
    pub maximum_temperature: Option<Decimal>,

    /// 是否直接燃烧流体。
    pub burns_fluid: Option<bool>,

    /// 是否按负载缩放流体用量。
    pub scale_fluid_usage: Option<bool>,

    /// 是否销毁非燃料流体。
    pub destroy_non_fuel_fluid: Option<bool>,

    /// 目标输出温度。
    pub target_temperature: Option<Decimal>,

    /// 锅炉工作模式。
    pub boiler_mode: Option<BoilerMode>,

    /// 邻接加成倍率。
    pub neighbour_bonus: Option<Decimal>,

    /// 白天太阳能表现倍率。
    pub solar_panel_performance_at_day: Option<Decimal>,

    /// 夜晚太阳能表现倍率。
    pub solar_panel_performance_at_night: Option<Decimal>,

    /// 采矿速度。
    pub mining_speed: Option<Decimal>,

    /// 采矿半径。
    pub mining_drill_radius: Option<Decimal>,

    /// 可开采的资源类别列表。
    ///
    /// 这些值会引用顶层 `resource_categories`。
    pub resource_categories: Option<Vec<ResourceCategory>>,

    /// 实验室接受的科技包物品名称列表。
    ///
    /// 这些值会引用 `items.name`。
    pub lab_inputs: Option<Vec<String>>,

    /// 研究速度。
    pub researching_speed: Option<Decimal>,

    /// 科技包额外消耗倍率。
    pub science_pack_drain_rate_percent: Option<Decimal>,

    /// Beacon 分发效率。
    pub distribution_effectivity: Option<Decimal>,

    /// Beacon 分发效率受品质影响的额外倍率。
    pub distribution_effectivity_bonus_per_quality_level: Option<Decimal>,

    /// Beacon 强度曲线。
    ///
    /// 列表位置与品质等级一一对应，后续可与 `qualities.level` 建立隐式关联。
    pub beacon_profile: Option<Vec<Decimal>>,

    /// Beacon 计数模式。
    pub beacon_counter: Option<BeaconCounter>,

    /// Beacon 作用半径。
    pub supply_area_distance: Option<Decimal>,

    /// 流体箱原型列表。
    ///
    /// 这是实体流体接口定义，通常适合拆成子表。
    pub fluidbox_prototypes: Option<Vec<FluidBoxPrototype>>,

    /// 下一级升级实体名称。
    ///
    /// 这是面向同表 `entities.name` 的自引用外键候选。
    pub next_upgrade: Option<String>,

    /// 品质是否影响模块槽数量。
    pub quality_affects_module_slots: Option<bool>,

    /// 地表条件限制。
    pub surface_conditions: Option<Vec<SurfaceCondition>>,

    /// 放置该实体所需的物品栈定义。
    ///
    /// `ItemStackDefinition.name` 会引用 `items.name`，是 `entity -> item` 方向的关键外键来源。
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
