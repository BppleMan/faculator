mod material_type;

pub use material_type::*;

use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleEffectModifier {
	pub bonus: Decimal,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ModuleEffects {
	pub consumption: Option<ModuleEffectModifier>,
	pub speed: Option<ModuleEffectModifier>,
	pub productivity: Option<ModuleEffectModifier>,
	pub pollution: Option<ModuleEffectModifier>,
	pub quality: Option<ModuleEffectModifier>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Product {
	#[serde(rename = "type")]
	pub material_type: MaterialType,
	pub name: String,
	pub amount: Option<Decimal>,
	pub amount_min: Option<Decimal>,
	pub amount_max: Option<Decimal>,
	pub probability: Option<Decimal>,
	pub temperature: Option<Decimal>,
	pub catalyst_amount: Option<Decimal>,
	pub percent_spoiled: Option<Decimal>,
	pub ignored_by_stats: Option<Decimal>,
	pub ignored_by_productivity: Option<Decimal>,
}
