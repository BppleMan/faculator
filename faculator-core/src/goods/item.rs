mod item_type;

pub use crate::category::{FuelCategory, ModuleCategory};
use crate::concept::{ModuleEffects, Product};
pub use item_type::*;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde::{Deserializer, de};
use serde_json::Value;
use std::cmp::Ordering;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Item {
    /// 物品内部 ID
    pub name: String,

    /// 物品类型，共 18 种：item, tool, ammo, armor, module, capsule, blueprint, repair-tool...
    #[serde(rename = "type")]
    pub item_type: ItemType,

    /// 所属大分组：combat / intermediate-products / logistics / production / space / other
    pub group: String,

    /// 所属子分组，46 种
    pub subgroup: String,

    /// 排序键
    pub order: String,

    /// 是否隐藏（39 个隐藏）
    pub hidden: bool,

    /// 堆叠数量，1~100000
    pub stack_size: u64,

    /// 重量（太空平台运载相关），0~10000000
    pub weight: Decimal,

    /// 默认导入星球：nauvis / vulcanus / fulgora / gleba / aquilo
    pub default_import_location: String,

    /// 燃料热值（焦耳），0 表示不是燃料
    pub fuel_value: u64,

    /// 燃料加速倍率
    pub fuel_acceleration_multiplier: Decimal,

    /// 燃料极速倍率
    pub fuel_top_speed_multiplier: Decimal,

    /// 燃料排放倍率
    pub fuel_emissions_multiplier: u64,

    /// 物品标志位。
    #[serde(default, deserialize_with = "deserialize_flags")]
    pub flags: Vec<ItemFlag>,

    /// 燃料类别，仅可燃物品存在。
    pub fuel_category: Option<FuelCategory>,

    /// 模块效果，仅模块存在。
    pub module_effects: Option<ModuleEffects>,

    /// 模块类别，仅模块存在。
    #[serde(rename = "category")]
    pub module_category: Option<ModuleCategory>,

    /// 模块等级，仅模块存在。
    pub tier: Option<u64>,

    /// 放置后生成的实体。
    pub place_result: Option<String>,

    /// 火箭发射后额外获得的产物。
    pub rocket_launch_products: Option<Vec<Product>>,

    /// 放置后生成的装备。
    pub place_as_equipment_result: Option<String>,

    /// 腐坏结果。
    pub spoil_result: Option<String>,

    /// 燃烧结果。
    pub burnt_result: Option<String>,
}

fn deserialize_flags<'de, D>(deserializer: D) -> Result<Vec<ItemFlag>, D::Error>
where
    D: Deserializer<'de>,
{
    let value = Value::deserialize(deserializer)?;
    match value {
        Value::Null => Ok(Vec::new()),
        Value::Array(values) => values
            .into_iter()
            .map(|value| match value {
                Value::String(flag) => Ok(ItemFlag::from(flag)),
                other => Err(de::Error::custom(format!("invalid item flag value: {other}"))),
            })
            .collect(),
        Value::Object(object) if object.is_empty() => Ok(Vec::new()),
        other => Err(de::Error::custom(format!(
            "flags must be an array or empty object, got {other}"
        ))),
    }
}

impl PartialOrd<Self> for Item {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Item {
    fn cmp(&self, other: &Self) -> Ordering {
        self.order.cmp(&other.order).then(self.name.cmp(&other.name))
    }
}
