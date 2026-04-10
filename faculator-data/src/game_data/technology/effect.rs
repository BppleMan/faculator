use crate::game_data::technology::TechnologyEffectModifier;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 科技效果对象。
///
/// 导出器并没有为不同 effect type 提供完全不同的对象结构，而是共享一个“`type` +
/// 少量可选附加字段”的扁平对象：
///
/// - `unlock-recipe` 会带 `recipe`
/// - `unlock-space-location` 会带 `space_location`
/// - 大多数数值增益会带 `modifier`
///
/// 因此 source DTO 先保持这种扁平形式，后续进入 read/core 层时再决定是否拆成枚举。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct TechnologyEffect {
    /// 效果类型。
    pub r#type: String,

    /// 效果附带的修改值。
    ///
    /// 这个字段可能是布尔、整数或小数，因此这里使用联合枚举承接。
    pub modifier: Option<TechnologyEffectModifier>,

    /// 被解锁的配方名称。
    ///
    /// 当 `type = unlock-recipe` 时，该字段会引用 `recipes.name`。
    pub recipe: Option<String>,

    /// 被解锁的空间地点名称。
    ///
    /// 当 `type = unlock-space-location` 时，该字段会引用 `space_locations.name`。
    pub space_location: Option<String>,

    /// 与 `UnlockQualityModifier.quality` 对齐的前向兼容位。
    pub quality: Option<String>,

    /// 与 `ChangeRecipeProductivityModifier.change` 对齐的前向兼容位。
    pub change: Option<Decimal>,
}
