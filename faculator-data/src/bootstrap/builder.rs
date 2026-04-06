use crate::bootstrap::BuildDatabaseConfig;
use crate::game_data::GameData;
use color_eyre::eyre::{Result, WrapErr, bail};
use faculator_migration::{Migrator, MigratorTrait};
use sea_orm::{ConnectOptions, Database, DatabaseConnection};

pub struct GameDatabaseBuilder {
    config: BuildDatabaseConfig,
}

impl GameDatabaseBuilder {
    pub fn new(config: BuildDatabaseConfig) -> Self {
        Self { config }
    }

    pub async fn build(&self) -> Result<()> {
        let document = self.load_source_document().await?;
        let connection = self.open_database().await?;

        self.prepare_database(&connection).await?;
        self.inspect_document(&document)?;

        bail!("database build skeleton is ready, but transform/import steps are not implemented yet")
    }

    async fn load_source_document(&self) -> Result<GameData> {
        let raw = tokio::fs::read_to_string(&self.config.game_data_path).await.wrap_err_with(|| {
            format!(
                "failed to read game data file: {}",
                self.config.game_data_path.display()
            )
        })?;

        serde_json::from_str(&raw).wrap_err("failed to parse exported game-data json")
    }

    async fn open_database(&self) -> Result<DatabaseConnection> {
        let url = format!("sqlite://{}?mode=rwc", self.config.database_path.display());
        let mut options = ConnectOptions::new(url);
        options.sqlx_logging(false);
        options.map_sqlx_sqlite_opts(|sqlite| sqlite.foreign_keys(true));

        Database::connect(options).await.wrap_err_with(|| {
            format!(
                "failed to open sqlite database: {}",
                self.config.database_path.display()
            )
        })
    }

    async fn prepare_database(&self, connection: &DatabaseConnection) -> Result<()> {
        if self.config.fresh {
            Migrator::fresh(connection)
                .await
                .wrap_err("failed to recreate database schema with migrations")?;
        } else {
            Migrator::up(connection, None)
                .await
                .wrap_err("failed to apply database migrations")?;
        }

        Ok(())
    }

    fn inspect_document(&self, _document: &GameData) -> Result<()> {
        Ok(())
    }

    #[allow(dead_code)]
    fn extract_game_metadata<'a>(&self, document: &'a GameData) -> &'a crate::game_data::game::Game {
        &document.game
    }

    #[allow(dead_code)]
    async fn import_game_metadata(&self, _connection: &DatabaseConnection, _document: &GameData) -> Result<()> {
        bail!("not implemented: persist game metadata")
    }

    #[allow(dead_code)]
    async fn import_items(&self, _connection: &DatabaseConnection, _document: &GameData) -> Result<()> {
        bail!("not implemented: persist items")
    }

    #[allow(dead_code)]
    async fn import_fluids(&self, _connection: &DatabaseConnection, _document: &GameData) -> Result<()> {
        bail!("not implemented: persist fluids")
    }

    #[allow(dead_code)]
    async fn import_recipes(&self, _connection: &DatabaseConnection, _document: &GameData) -> Result<()> {
        bail!("not implemented: persist recipes")
    }

    #[allow(dead_code)]
    async fn import_entities(&self, _connection: &DatabaseConnection, _document: &GameData) -> Result<()> {
        bail!("not implemented: persist entities")
    }
}
