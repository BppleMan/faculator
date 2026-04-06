use crate::game_data::serde_helper::deserialize_vec_or_empty_object;
use crate::game_data::technology::{ResearchTrigger, ResearchUnitIngredient, TechnologyEffect};
use serde::{Deserialize, Serialize};

/// 一个科技原型。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
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
    /// 当前样本中是整数；若未来导出支持“无限科技”字符串语义，再在 source DTO 层扩展。
    pub max_level: u64,

    /// 研究所需单位数。
    pub research_unit_count: u64,

    /// 每个研究单位耗时。
    pub research_unit_energy: u64,

    /// 研究所需科技包列表。
    ///
    /// `ResearchUnitIngredient.name` 会引用 `items.name`，是科技与物品之间的重要外键。
    #[serde(default, deserialize_with = "deserialize_vec_or_empty_object")]
    pub research_unit_ingredients: Vec<ResearchUnitIngredient>,

    /// 特殊研究触发器。
    ///
    /// 某些科技不是靠常规科研包推进，而是靠行为触发。
    pub research_trigger: Option<ResearchTrigger>,

    /// 前置科技列表。
    ///
    /// 这是面向同表 `technologies.name` 的自引用多对多关系来源。
    #[serde(default, deserialize_with = "deserialize_vec_or_empty_object")]
    pub prerequisites: Vec<String>,

    /// 科技效果列表。
    ///
    /// `unlock-recipe`、`unlock-space-location` 等效果会把科技与其他主表连接起来。
    #[serde(default, deserialize_with = "deserialize_vec_or_empty_object")]
    pub effects: Vec<TechnologyEffect>,

    /// 该科技对应的配方是否允许生产力。
    pub allows_productivity: bool,

    /// 后继科技列表。
    ///
    /// 这是面向同表 `technologies.name` 的反向自引用关系来源。
    #[serde(default, deserialize_with = "deserialize_vec_or_empty_object")]
    pub successors: Vec<String>,

    /// 无限科技或等级链科技的研究单位公式。
    pub research_unit_count_formula: Option<String>,
}
