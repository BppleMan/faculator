use crate::{
    category::{FuelCategory, ModuleCategory, RecipeCategory, ResourceCategory},
    entity::Entity,
    equipment::{Equipment, EquipmentGrid},
    item_group::ItemGroup,
    material::{Fluid, Item},
    quality::Quality,
    recipe::Recipe,
    space::{SpaceConnection, SpaceLocation},
    technology::Technology,
};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// 一次导出快照对应的元数据。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Game {
    pub exporter_version: String,
    pub factorio_version: String,
    pub active_mods: BTreeMap<String, String>,
}

/// 与 `game-data.json` 根对象对应的 core 入口。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct GameData {
    pub game: Game,
    #[serde(default)]
    pub recipe_categories: Vec<RecipeCategory>,
    #[serde(default)]
    pub fuel_categories: Vec<FuelCategory>,
    #[serde(default)]
    pub resource_categories: Vec<ResourceCategory>,
    #[serde(default)]
    pub module_categories: Vec<ModuleCategory>,
    #[serde(default)]
    pub items: Vec<Item>,
    #[serde(default)]
    pub fluids: Vec<Fluid>,
    #[serde(default)]
    pub recipes: Vec<Recipe>,
    #[serde(default)]
    pub entities: Vec<Entity>,
    #[serde(default)]
    pub item_groups: Vec<ItemGroup>,
    #[serde(default)]
    pub technologies: Vec<Technology>,
    #[serde(default)]
    pub qualities: Vec<Quality>,
    #[serde(default)]
    pub space_locations: Vec<SpaceLocation>,
    #[serde(default)]
    pub space_connections: Vec<SpaceConnection>,
    #[serde(default)]
    pub equipment: Vec<Equipment>,
    #[serde(default)]
    pub equipment_grids: Vec<EquipmentGrid>,
}
