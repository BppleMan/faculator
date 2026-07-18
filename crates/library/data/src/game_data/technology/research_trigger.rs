use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 研究触发器对象。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ResearchTrigger {
    /// 触发类型。
    ///
    /// 原始 JSON 使用 `type` 键。
    #[serde(rename = "type")]
    pub trigger_type: String,

    /// 与原型 API 中若干 technology trigger 变体对齐的前向兼容位。
    pub entity: Option<String>,

    /// 与原型 API 中若干 technology trigger 变体对齐的前向兼容位。
    pub item: Option<String>,

    /// 与原型 API 中若干 technology trigger 变体对齐的前向兼容位。
    pub fluid: Option<String>,

    /// 与原型 API 中 `CraftItemTechnologyTrigger.count` 对齐的前向兼容位。
    pub count: Option<u64>,

    /// 与原型 API 中 `CraftFluidTechnologyTrigger.amount` 对齐的前向兼容位。
    pub amount: Option<Decimal>,
}
