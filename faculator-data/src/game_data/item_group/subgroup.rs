use serde::{Deserialize, Serialize};

/// `item_groups[].subgroups[]` 中的子分组对象。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ItemSubgroup {
    /// 子分组名称。
    ///
    /// 这是 `items.subgroup`、`recipes.subgroup`、`entities.subgroup` 的外键候选。
    pub name: String,

    /// 子分组在所属大分组内的排序键。
    pub order: String,
}
