use serde::{Deserialize, Serialize};

/// 放置能力模型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct PlacementCapability {
    /// 放置后生成的实体名称。
    pub place_result: Option<String>,

    /// 放置后生成的装备名称。
    pub place_as_equipment_result: Option<String>,
}
