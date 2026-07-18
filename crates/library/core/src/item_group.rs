use faculator_macros::ID;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct ItemGroupId(String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct ItemSubgroupId(String);

/// 一个展示目录分组。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ItemGroup {
    pub name: ItemGroupId,
    pub item_group_type: String,
    pub order: String,
    pub subgroups: Vec<ItemSubgroup>,
}

/// 一个展示目录子分组。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ItemSubgroup {
    pub name: ItemSubgroupId,
    pub order: String,
}
