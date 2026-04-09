use serde::{Deserialize, Serialize};

/// 模块能力模型。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModuleItem {
    /// 模块效果定义。
    ///
    /// 用于表达 speed / productivity / quality 等加成。
    pub effects: Option<ModuleEffects>,

    /// 模块类别。
    ///
    /// 原始 JSON 使用 `category` 键；当该字段存在时，会引用顶层 `module_categories`。
    #[serde(rename = "category")]
    pub category: Option<ModuleCategory>,

    /// 模块等级。
    pub tier: Option<u64>,
}
