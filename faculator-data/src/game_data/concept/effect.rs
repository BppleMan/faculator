//! 模块效果与效果接收器相关 DTO。
//!
//! runtime API 在模块物品和实体效果接收器上使用 `ModuleEffects`，
//! prototype API 在模块原型上使用 `Effect`。
//! 二者字段形状相同，因此 source DTO 只保留一份值对象定义。
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 单个模块效果值。
///
/// runtime API 中对应 `ModuleEffectValue`，prototype API 中对应 `EffectValue`。
pub type ModuleEffectValue = Decimal;

/// 一组模块效果值。
///
/// 该对象既对应 runtime API 中的 `ModuleEffects`，也对应 prototype API 中的效果对象。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleEffects {
    /// 能耗效果。
    pub consumption: Option<ModuleEffectValue>,

    /// 速度效果。
    pub speed: Option<ModuleEffectValue>,

    /// 生产力效果。
    pub productivity: Option<ModuleEffectValue>,

    /// 污染效果。
    pub pollution: Option<ModuleEffectValue>,

    /// 品质效果。
    pub quality: Option<ModuleEffectValue>,
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
