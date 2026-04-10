use serde::{Deserialize, Serialize};

/// 一条空间航线。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct SpaceConnection {
    /// 航线名称。
    ///
    /// 一般由 `from-to` 组成，可作为航线表自然键。
    pub name: String,

    /// 起点地点名称。
    ///
    /// 这是面向 `space_locations.name` 的外键候选。
    #[serde(rename = "from")]
    pub from_location: String,

    /// 终点地点名称。
    ///
    /// 这是面向 `space_locations.name` 的外键候选。
    #[serde(rename = "to")]
    pub to_location: String,

    /// 航线长度。
    pub length: u64,
}
