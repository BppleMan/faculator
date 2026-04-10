use serde::{Deserialize, Serialize};

/// 研究触发器对象。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ResearchTrigger {
    /// 触发类型。
    ///
    /// 原始 JSON 使用 `type` 键，DTO 直接保留其字符串值。
    #[serde(rename = "type")]
    pub trigger_type: String,
}
