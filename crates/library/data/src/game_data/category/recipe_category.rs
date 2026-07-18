use serde::{Deserialize, Serialize};

/// 顶层 `recipe_categories` 条目。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct RecipeCategory {
    /// 类别名称。
    pub name: String,
}
