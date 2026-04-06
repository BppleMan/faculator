use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 科技效果中的 `modifier` 联合值。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum TechnologyEffectModifier {
    /// 布尔开关型修改值。
    Boolean(bool),

    /// 整数修改值。
    Integer(i64),

    /// 小数修改值。
    Decimal(Decimal),
}
