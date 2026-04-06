use crate::game_data::equipment::EquipmentCategory;
use serde::{Deserialize, Serialize};

/// 一个装备网格原型。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EquipmentGrid {
    /// 网格名称。
    ///
    /// 这是装备网格表的自然主键。
    pub name: String,

    /// 所属展示大分组。
    pub group: String,

    /// 所属展示子分组。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 网格宽度。
    pub width: u64,

    /// 网格高度。
    pub height: u64,

    /// 是否锁定。
    pub locked: bool,

    /// 该网格允许安装的装备类别列表。
    pub equipment_categories: Vec<EquipmentCategory>,
}
