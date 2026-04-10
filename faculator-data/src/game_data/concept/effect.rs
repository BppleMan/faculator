//! 模块效果与效果接收器相关 DTO。
//!
//! 这些对象既会出现在模块物品中，也会出现在实体原型中，因此是模块系统 / beacon 系统的核心嵌套值对象。
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 单个效果项的倍率。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleEffectModifier {
    /// 加成值。
    ///
    /// 正值通常代表增益，负值通常代表惩罚。
    pub bonus: Decimal,
}

/// 一个模块效果集合。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleEffects {
    /// 能耗效果。
    pub consumption: Option<ModuleEffectModifier>,

    /// 速度效果。
    pub speed: Option<ModuleEffectModifier>,

    /// 生产力效果。
    pub productivity: Option<ModuleEffectModifier>,

    /// 污染效果。
    pub pollution: Option<ModuleEffectModifier>,

    /// 品质效果。
    pub quality: Option<ModuleEffectModifier>,
}

/// 一个实体对外部效果的接收策略。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct EffectReceiver {
    /// 基础效果。
    ///
    /// 该值表示实体自身就带有的基线效果，而非模块或 beacon 附加效果。
    pub base_effect: Option<ModuleEffects>,

    /// 是否接受模块效果。
    pub uses_module_effects: bool,

    /// 是否接受 beacon 效果。
    pub uses_beacon_effects: bool,

    /// 是否接受地表效果。
    pub uses_surface_effects: bool,
}
