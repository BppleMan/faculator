use crate::{category::ModuleCategory, concept::ModuleEffectSet};
use serde::{Deserialize, Serialize};

/// 模块能力模型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleCapability {
    /// 模块效果定义。
    pub effects: Option<ModuleEffectSet>,

    /// 模块类别。
    #[serde(rename = "category")]
    pub category: Option<ModuleCategory>,

    /// 模块等级。
    pub tier: Option<u64>,
}
