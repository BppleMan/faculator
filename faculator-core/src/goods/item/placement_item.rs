use serde::{Deserialize, Serialize};

/// 放置能力模型。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlacementItem {
    /// 放置后生成的实体名称。
    ///
    /// 这是面向 `entities.name` 的关键外键字段，是 `item` 和 `entity` 之间最重要的桥之一。
    pub place_result: Option<String>,

    /// 放置后生成的装备名称。
    ///
    /// 这是面向 `equipment.name` 的关键外键字段。
    pub place_as_equipment_result: Option<String>,
}
