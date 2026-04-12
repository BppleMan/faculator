use crate::entity::EntityId;
use serde::{Deserialize, Serialize};

/// 放置能力模型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct PlacementCapability {
    /// 放置后生成的实体名称。
    pub place_result: Option<EntityId>,

    /// 种植后生成的实体名称。
    ///
    /// prototype API 将其定义为 `EntityID`。当前导出样本中这些目标实体
    /// 未出现在 `entities` 集合里，但语义上仍先按实体身份建模。
    pub plant_result: Option<EntityId>,

    /// 放置后生成的装备名称。
    pub place_as_equipment_result: Option<String>,
}
