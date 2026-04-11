//! 顶层 `technologies` DTO。
//!
//! 科技对象是导出里关系最密集的一类原型之一：
//!
//! - `prerequisites[]` 指向其他科技
//! - `successors[]` 反向指向后继科技
//! - `effects[]` 解锁 recipe / quality / space_location 或修改某种游戏能力
//! - `research_unit_ingredients[]` 指向科技包物品
//!
//! 此外，导出器在这里使用了一个典型“小巧思”：
//!
//! - 当某个数组为空时，导出有时会给出 `{}` 而不是 `[]`
//!
//! 本模块会通过显式 DTO 类型保留这种双形态，避免在反序列化层做黑盒规整。
use crate::game_data::ArrayOrEmptyObject;
use serde::{Deserialize, Serialize};

mod effect;
mod effect_modifier;
mod research_trigger;
mod research_unit_ingredient;

pub use effect::*;
pub use effect_modifier::*;
pub use research_trigger::*;
pub use research_unit_ingredient::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum TechnologyMaxLevel {
    Finite(u64),
    Infinite(TechnologyInfiniteLiteral),
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub enum TechnologyInfiniteLiteral {
    #[serde(rename = "infinite")]
    Infinite,
}

/// 一个科技原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Technology {
    /// 科技名称。
    ///
    /// 这是科技表的自然主键，也是 `prerequisites` / `successors` 自引用关系的目标键。
    pub name: String,

    /// 所属展示大分组。
    pub group: String,

    /// 所属展示子分组。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 是否为关键科技。
    pub essential: bool,

    /// 是否默认启用。
    pub enabled: bool,

    /// 禁用时是否仍在 UI 中可见。
    pub visible_when_disabled: bool,

    /// 是否为升级链科技。
    pub upgrade: bool,

    /// 当前科技等级。
    pub level: u64,

    /// 最大科技等级。
    ///
    /// `prototype-api` 允许这里出现 `"infinite"`，因此 DTO 直接承接整数 / 字符串联合形态。
    pub max_level: TechnologyMaxLevel,

    /// 研究所需单位数。
    pub research_unit_count: u64,

    /// 每个研究单位耗时。
    pub research_unit_energy: u64,

    /// 研究所需科技包列表。
    ///
    /// `ResearchUnitIngredient.name` 会引用 `items.name`，是科技与物品之间的重要外键。
    #[serde(default)]
    pub research_unit_ingredients: ArrayOrEmptyObject<ResearchUnitIngredient>,

    /// 特殊研究触发器。
    ///
    /// 某些科技不是靠常规科研包推进，而是靠行为触发。
    pub research_trigger: Option<ResearchTrigger>,

    /// 前置科技列表。
    ///
    /// 这是面向同表 `technologies.name` 的自引用多对多关系来源。
    #[serde(default)]
    pub prerequisites: ArrayOrEmptyObject<String>,

    /// 科技效果列表。
    ///
    /// `unlock-recipe`、`unlock-space-location` 等效果会把科技与其他主表连接起来。
    #[serde(default)]
    pub effects: ArrayOrEmptyObject<TechnologyEffect>,

    /// 该科技对应的配方是否允许生产力。
    pub allows_productivity: bool,

    /// 后继科技列表。
    ///
    /// 这是面向同表 `technologies.name` 的反向自引用关系来源。
    #[serde(default)]
    pub successors: ArrayOrEmptyObject<String>,

    /// 无限科技或等级链科技的研究单位公式。
    pub research_unit_count_formula: Option<String>,
}
