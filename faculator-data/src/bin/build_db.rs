use color_eyre::eyre::{Result, WrapErr, bail};
use faculator_data::bootstrap::{BuildDatabaseConfig, GameDatabaseBuilder};
use std::path::PathBuf;

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;

    let config = parse_args()?;
    let builder = GameDatabaseBuilder::new(config);

    builder.build().await
}

fn parse_args() -> Result<BuildDatabaseConfig> {
    let args = std::env::args().skip(1).collect::<Vec<_>>();

    if args.len() < 2 || args.len() > 3 {
        bail!(
            "usage: cargo run -p faculator-data --bin build_db -- <game-data.json> <output.sqlite> [--fresh]"
        );
    }

    let fresh = args.iter().any(|arg| arg == "--fresh");
    let positional = args
        .into_iter()
        .filter(|arg| arg != "--fresh")
        .collect::<Vec<_>>();

    if positional.len() != 2 {
        bail!(
            "usage: cargo run -p faculator-data --bin build_db -- <game-data.json> <output.sqlite> [--fresh]"
        );
    }

    let game_data_path = PathBuf::from(&positional[0]);
    let database_path = PathBuf::from(&positional[1]);

    if !game_data_path.exists() {
        bail!("game data file does not exist: {}", game_data_path.display());
    }

    if let Some(parent) = database_path.parent()
        && !parent.as_os_str().is_empty()
        && !parent.exists()
    {
        std::fs::create_dir_all(parent).wrap_err_with(|| {
            format!("failed to create database directory: {}", parent.display())
        })?;
    }

    Ok(BuildDatabaseConfig {
        game_data_path,
        database_path,
        fresh,
    })
}