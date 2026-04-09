use super::*;
use serde::{Deserialize, Serialize};

/// 物品能力集合。
#[derive(Debug, Clone, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct ItemCapabilities {
    /// 燃料能力。
    pub fuel: Option<FuelItem>,

    /// 模块能力。
    pub module: Option<ModuleItem>,

    /// 放置能力（放置成实体/装备）。
    pub placement: Option<PlacementItem>,

    /// 转化能力（火箭发射、腐坏、燃烧后的结果）。
    pub transformation: Option<TransformationItem>,
}
