use crate::{
    entity::EntityId,
    material::{FluidId, ItemId},
    quality::QualityId,
    recipe::RecipeId,
    space::SpaceLocationId,
};
use faculator_macros::ID;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct TechnologyId(String);

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum TechnologyMaxLevel {
    Finite(u64),
    Infinite(TechnologyInfiniteLiteral),
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub enum TechnologyInfiniteLiteral {
    #[serde(rename = "infinite")]
    Infinite,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum TechnologyEffectModifier {
    Boolean(bool),
    Integer(i64),
    Decimal(Decimal),
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct TechnologyEffect {
    pub effect_type: String,
    pub modifier: Option<TechnologyEffectModifier>,
    pub recipe: Option<RecipeId>,
    pub space_location: Option<SpaceLocationId>,
    pub quality: Option<QualityId>,
    pub change: Option<Decimal>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ResearchTrigger {
    pub trigger_type: String,
    pub entity: Option<EntityId>,
    pub item: Option<ItemId>,
    pub fluid: Option<FluidId>,
    pub count: Option<u64>,
    pub amount: Option<Decimal>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ResearchUnitIngredient {
    pub item: ItemId,
    pub amount: u64,
}

/// 一个科技原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Technology {
    pub name: TechnologyId,
    pub order: String,
    pub hidden: bool,
    pub essential: bool,
    pub enabled: bool,
    pub visible_when_disabled: bool,
    pub upgrade: bool,
    pub level: u64,
    pub max_level: TechnologyMaxLevel,
    pub research_unit_count: u64,
    pub research_unit_energy: u64,
    #[serde(default)]
    pub research_unit_ingredients: Vec<ResearchUnitIngredient>,
    pub research_trigger: Option<ResearchTrigger>,
    #[serde(default)]
    pub prerequisites: Vec<TechnologyId>,
    #[serde(default)]
    pub effects: Vec<TechnologyEffect>,
    pub allows_productivity: bool,
    #[serde(default)]
    pub successors: Vec<TechnologyId>,
    pub research_unit_count_formula: Option<String>,
}
