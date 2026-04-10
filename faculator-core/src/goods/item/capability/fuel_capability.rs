use crate::category::FuelCategory;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 燃料能力模型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct FuelCapability {
    /// 燃料热值。
    ///
    /// `0` 表示该物品不是燃料；大于 `0` 时可与 `fuel_category` 联动参与燃料兼容性判断。
    pub fuel_value: u64,

    /// 作为车辆燃料时的加速倍率。
    pub fuel_acceleration_multiplier: Decimal,

    /// 作为车辆燃料时的极速倍率。
    pub fuel_top_speed_multiplier: Decimal,

    /// 作为燃料时的排放倍率。
    pub fuel_emissions_multiplier: u64,

    /// 燃料类别。
    pub fuel_category: Option<FuelCategory>,
}
