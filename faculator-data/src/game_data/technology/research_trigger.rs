use crate::game_data::technology::ResearchTriggerType;
use serde::{Deserialize, Serialize};

/// 研究触发器对象。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ResearchTrigger {
    /// 触发类型。
    ///
    /// 原始 JSON 使用 `type` 键，这里映射为更语义化的 `trigger_type`。
    #[serde(rename = "type")]
    pub trigger_type: ResearchTriggerType,
}
