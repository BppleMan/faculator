use crate::{
    category::{ModuleCategory, RecipeCategory},
    concept::{Ingredient, MaterialRef, Product, SurfaceCondition},
};
use faculator_macros::ID;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 配方原型的稳定身份。
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct RecipeId(String);

/// 一个配方原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Recipe {
    pub name: RecipeId,
    pub order: String,
    pub hidden: bool,
    pub category: RecipeCategory,
    pub energy: Decimal,
    #[serde(default)]
    pub ingredients: Vec<Ingredient>,
    #[serde(default)]
    pub products: Vec<Product>,
    pub main_product: Option<MaterialRef>,
    pub enabled: bool,
    pub allow_decomposition: bool,
    pub allow_as_intermediate: bool,
    pub allow_intermediates: bool,
    pub always_show_made_in: bool,
    pub always_show_products: bool,
    pub show_amount_in_title: bool,
    pub emissions_multiplier: Decimal,
    #[serde(default)]
    pub allowed_effects: Vec<String>,
    pub allowed_module_categories: Option<Vec<ModuleCategory>>,
    pub maximum_productivity: Decimal,
    pub hide_from_player_crafting: bool,
    pub surface_conditions: Option<Vec<SurfaceCondition>>,
    pub additional_categories: Option<Vec<RecipeCategory>>,
    pub unlock_results: Option<Vec<MaterialRef>>,
}
