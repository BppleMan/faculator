use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModuleEffectModifier {
    pub bonus: Decimal,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModuleEffects {
    pub consumption: Option<ModuleEffectModifier>,
    pub speed: Option<ModuleEffectModifier>,
    pub productivity: Option<ModuleEffectModifier>,
    pub pollution: Option<ModuleEffectModifier>,
    pub quality: Option<ModuleEffectModifier>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EffectReceiver {
    pub base_effect: Option<ModuleEffects>,
    pub uses_module_effects: bool,
    pub uses_beacon_effects: bool,
    pub uses_surface_effects: bool,
}