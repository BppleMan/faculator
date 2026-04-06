use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct BuildDatabaseConfig {
    pub game_data_path: PathBuf,
    pub database_path: PathBuf,
    pub fresh: bool,
}
