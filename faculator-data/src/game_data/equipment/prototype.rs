use crate::game_data::equipment::EquipmentShape;
use crate::game_data::serde_helper::ArrayOrEmptyObject;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 一个装甲装备原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Equipment {
    /// 装备名称。
    ///
    /// 这是装备表的自然主键。
    pub name: String,

    /// 装备原型类型。
    ///
    /// 原始 JSON 使用 `type` 字段，DTO 直接保留其字符串值。
    #[serde(rename = "type")]
    pub equipment_type: String,

    /// 所属展示大分组。
    pub group: String,

    /// 所属展示子分组。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 持续发电量。
    ///
    /// 某些装备是发电设备，因此这里允许小数。
    pub energy_production: Decimal,

    /// 每点护盾所需能量。
    pub energy_per_shield: u64,

    /// 装备占用的网格尺寸。
    pub shape: EquipmentShape,

    /// 可安装到哪些装备类别网格中。
    ///
    /// 导出里空列表可能写成 `{}`；DTO 直接保留这种双形态。
    #[serde(default)]
    pub equipment_categories: ArrayOrEmptyObject<String>,

    /// 拆下或拾取时返回的物品名称。
    ///
    /// 这是面向 `items.name` 的关键外键线索。
    pub take_result: Option<String>,
}
