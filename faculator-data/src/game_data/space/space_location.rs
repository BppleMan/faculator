use crate::game_data::space::{SpacePosition, SurfaceProperty};
use serde::{Deserialize, Serialize};

/// 一个太空地点或星球原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct SpaceLocation {
    /// 地点名称。
    ///
    /// 这是空间位置表的自然主键，也会被 `SpaceConnection` 和科技效果引用。
    pub name: String,

    /// 所属展示大分组。
    pub group: String,

    /// 所属展示子分组。
    pub subgroup: String,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 该地点在太空中的太阳能倍率。
    pub solar_power_in_space: u64,

    /// 星图位置坐标。
    pub position: SpacePosition,

    /// 地表属性。
    ///
    /// 某些地点没有可落地表面，因此该字段可以为空。
    pub surface_properties: Option<SurfaceProperty>,
}
