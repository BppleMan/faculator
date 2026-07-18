use serde::{Deserialize, Serialize};

/// `space_locations[].surface_properties` 对象。
///
/// 这些字段在 JSON 里使用 `kebab-case`，因此在结构体级别统一声明 serde 命名规则。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct SurfaceProperty {
    /// 昼夜周期。
    pub day_night_cycle: Option<u64>,

    /// 磁场强度。
    pub magnetic_field: Option<u64>,

    /// 地表太阳能倍率。
    pub solar_power: Option<u64>,

    /// 气压。
    pub pressure: Option<u64>,

    /// 重力。
    pub gravity: Option<u64>,
}
