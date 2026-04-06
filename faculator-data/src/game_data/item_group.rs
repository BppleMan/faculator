//! 顶层 `item_groups` DTO。
//!
//! 这一组数据表达的是 Factorio 的展示目录树，而不是生产规则本身：
//!
//! - `ItemGroup` 是大分类
//! - `ItemSubgroup` 是子分类
//! - `items.group` / `items.subgroup`
//! - `recipes.group` / `recipes.subgroup`
//! - `entities.group` / `entities.subgroup`
//!
//! 都会指向这里定义的目录名称，因此这是构建展示侧 SQL 外键的重要来源。
mod item_group_type;
mod subgroup;

pub use item_group_type::*;
pub use subgroup::*;

use serde::{Deserialize, Serialize};

/// 一个顶层物品分组。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ItemGroup {
    /// 分组名称。
    ///
    /// 这是 `items.group`、`recipes.group`、`entities.group` 的外键候选。
    pub name: String,

    /// 分组原型类型。
    ///
    /// 当前导出样本中固定为 `"item-group"`，保留该字段是为了完整反映原始 JSON。
    #[serde(rename = "type")]
    pub item_group_type: ItemGroupType,

    /// UI / 百科排序键。
    ///
    /// 该字段是纯展示信息，通常不参与业务计算，但会影响目录显示顺序。
    pub order: String,

    /// 该分组下的子分组列表。
    ///
    /// 这些子项会被各类原型对象通过 `subgroup` 字段引用。
    pub subgroups: Vec<ItemSubgroup>,
}
