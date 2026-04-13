use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleEffectModifier {
    pub bonus: Decimal,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleEffect {
    pub consumption: Option<ModuleEffectModifier>,
    pub speed: Option<ModuleEffectModifier>,
    pub productivity: Option<ModuleEffectModifier>,
    pub pollution: Option<ModuleEffectModifier>,
    pub quality: Option<ModuleEffectModifier>,
}

/// 一个实体对外部效果的接收策略。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct EffectReceiver {
    /// 实体自带的基线效果。
    pub base_effect: Option<ModuleEffect>,

    /// 是否接受模块效果。
    pub uses_module_effects: bool,

    /// 是否接受 beacon 效果。
    pub uses_beacon_effects: bool,

    /// 是否接受地表效果。
    pub uses_surface_effects: bool,
}
