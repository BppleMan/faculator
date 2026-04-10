use serde::{Deserialize, Serialize};

/// `space_locations[].surface_properties` 对象。
///
/// 这些字段在 JSON 里有带连字符的命名，这里通过 `serde(rename)` 显式映射出来。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct SurfacePropertySet {
    /// 昼夜周期。
    #[serde(rename = "day-night-cycle")]
    pub day_night_cycle: Option<u64>,

    /// 磁场强度。
    #[serde(rename = "magnetic-field")]
    pub magnetic_field: Option<u64>,

    /// 地表太阳能倍率。
    #[serde(rename = "solar-power")]
    pub solar_power: Option<u64>,

    /// 气压。
    pub pressure: Option<u64>,

    /// 重力。
    pub gravity: Option<u64>,
}
