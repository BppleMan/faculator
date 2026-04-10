use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;

use color_eyre::eyre::{Result, WrapErr};
use serde::Deserialize;

pub type PrototypeNames = HashMap<String, HashSet<String>>;

#[derive(Deserialize)]
pub struct GameData {
    #[serde(default)]
    items: Vec<Named>,
    #[serde(default)]
    fluids: Vec<Named>,
    #[serde(default)]
    recipes: Vec<Named>,
    #[serde(default)]
    technologies: Vec<Named>,
    #[serde(default)]
    entities: Vec<Named>,
    #[serde(default)]
    equipment: Vec<Named>,
    #[serde(default)]
    #[allow(dead_code)]
    equipment_grids: Vec<Named>,
    #[serde(default)]
    qualities: Vec<Named>,
    #[serde(default)]
    space_locations: Vec<Named>,
    #[serde(default)]
    space_connections: Vec<SpaceConnection>,
    #[serde(default)]
    item_groups: Vec<Named>,
}

#[derive(Deserialize)]
struct Named {
    name: String,
}

#[derive(Deserialize)]
struct SpaceConnection {
    name: String,
}

pub fn load_prototype_names(path: &Path) -> Result<PrototypeNames> {
    let content = fs::read_to_string(path).wrap_err_with(|| format!("读取 game-data.json 失败: {}", path.display()))?;

    parse_prototype_names(&content).wrap_err("解析 game-data.json 失败")
}

fn parse_prototype_names(content: &str) -> Result<PrototypeNames> {
    let data: GameData = serde_json::from_str(content)?;
    Ok(prototype_names_from_game_data(data))
}

fn prototype_names_from_game_data(data: GameData) -> PrototypeNames {
    let mut names_by_category = PrototypeNames::new();

    insert_named_set(&mut names_by_category, "item", data.items);
    insert_named_set(&mut names_by_category, "fluid", data.fluids);
    insert_named_set(&mut names_by_category, "recipe", data.recipes);
    insert_named_set(&mut names_by_category, "technology", data.technologies);
    insert_named_set(&mut names_by_category, "entity", data.entities);
    insert_named_set(&mut names_by_category, "equipment", data.equipment);
    insert_named_set(&mut names_by_category, "quality", data.qualities);
    insert_named_set(&mut names_by_category, "space_location", data.space_locations);
    insert_named_set(&mut names_by_category, "item_group", data.item_groups);

    let space_connection_names = data
        .space_connections
        .into_iter()
        .map(|connection| connection.name)
        .collect::<HashSet<_>>();

    if !space_connection_names.is_empty() {
        names_by_category.insert("space_connection".to_string(), space_connection_names);
    }

    names_by_category
}

fn insert_named_set(names_by_category: &mut PrototypeNames, category: &str, values: Vec<Named>) {
    let names = values.into_iter().map(|value| value.name).collect::<HashSet<_>>();
    names_by_category.insert(category.to_string(), names);
}

#[cfg(test)]
mod tests {
    use super::parse_prototype_names;

    #[test]
    fn parse_prototype_names_groups_known_categories() {
        let json = r#"
        {
          "items": [{"name": "iron-plate"}, {"name": "copper-plate"}],
          "entities": [{"name": "assembling-machine-1"}],
          "space_connections": [{"name": "nauvis-orbit"}]
        }
        "#;

        let names = parse_prototype_names(json).unwrap();

        assert!(names["item"].contains("iron-plate"));
        assert!(names["item"].contains("copper-plate"));
        assert!(names["entity"].contains("assembling-machine-1"));
        assert!(names["space_connection"].contains("nauvis-orbit"));
    }
}
