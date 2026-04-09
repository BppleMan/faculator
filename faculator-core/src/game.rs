use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Eq, PartialEq)]
#[derive(Serialize, Deserialize)]
pub struct Game {
    pub exporter_version: String,
    pub factorio_version: String,
    pub active_mods: Vec<Mod>,
}

#[derive(Debug, Clone, Eq, PartialEq)]
#[derive(Serialize, Deserialize)]
pub struct Mod {
    pub name: String,
    pub version: String,
}
