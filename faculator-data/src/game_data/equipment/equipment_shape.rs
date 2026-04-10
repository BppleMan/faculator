use serde::{Deserialize, Serialize};

/// 装备占用的网格宽高。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct EquipmentShape {
    /// 宽度。
    pub width: u64,

    /// 高度。
    pub height: u64,

    /// 装备形状类型。
    ///
    /// exporter 会根据 `points` 是否存在推导为 `full` 或 `manual`。
    pub r#type: Option<String>,

    /// 手工形状占据的格点列表。
    pub points: Option<Vec<Vec<u32>>>,
}
