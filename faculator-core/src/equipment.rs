use crate::{concept::ElectricEnergySource, material::ItemId};
use faculator_macros::ID;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct EquipmentId(String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct EquipmentGridId(String);

/// 一个装甲装备原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Equipment {
    pub name: EquipmentId,
    pub equipment_type: String,
    pub order: String,
    pub hidden: bool,
    pub energy_production: Decimal,
    pub energy_per_shield: Decimal,
    pub energy_source: Option<ElectricEnergySource>,
    pub shape: EquipmentShape,
    #[serde(default)]
    pub equipment_categories: Vec<String>,
    pub take_result: Option<ItemId>,
}

/// 一个装备网格原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct EquipmentGrid {
    pub name: EquipmentGridId,
    pub order: String,
    pub hidden: bool,
    pub width: u64,
    pub height: u64,
    pub locked: bool,
    #[serde(default)]
    pub equipment_categories: Vec<String>,
}

/// 装备占用的网格宽高。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct EquipmentShape {
    pub width: u64,
    pub height: u64,
    pub shape_type: Option<String>,
    pub points: Option<Vec<Vec<u32>>>,
}
