use serde::{Deserialize, Serialize};

/// 装备占用的网格宽高。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EquipmentShape {
    /// 宽度。
    pub width: u64,

    /// 高度。
    pub height: u64,
}
