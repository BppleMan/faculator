use std::path::{Path, PathBuf};

use color_eyre::eyre::Result;

use crate::common::paths::{detect_factorio_bin, detect_factorio_mods_dir, detect_script_output};

pub const ICONS_DIR: &str = "assets/icons";
pub const ICON_ATLAS_DIR: &str = "assets/icon-atlas";
pub const EXPORTED_DIR: &str = "assets/exported";
pub const GAME_DATA_PATH: &str = "assets/exported/game-data.json";
pub const MOD_SOURCE_DIR: &str = "mods/faculator-expoter";

// `None` means infer from mods/faculator-expoter/info.json.
pub const MOD_NAME: Option<&str> = None;

pub fn icons_dir() -> &'static Path {
    Path::new(ICONS_DIR)
}

pub fn icon_atlas_dir() -> &'static Path {
    Path::new(ICON_ATLAS_DIR)
}

pub fn exported_dir() -> &'static Path {
    Path::new(EXPORTED_DIR)
}

pub fn game_data_path() -> &'static Path {
    Path::new(GAME_DATA_PATH)
}

pub fn mod_name() -> Option<&'static str> {
    MOD_NAME
}

pub fn factorio_bin() -> Result<PathBuf> {
    detect_factorio_bin()
}

pub fn mods_dir() -> Result<PathBuf> {
    detect_factorio_mods_dir()
}

pub fn script_output_dir() -> Result<PathBuf> {
    detect_script_output()
}
