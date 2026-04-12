mod material_type;
mod product;

pub use material_type::*;
pub use product::*;

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
