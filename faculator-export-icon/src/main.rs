mod atlas;
mod cli;
mod game_data;
mod icons;
mod matching;
mod organize;
mod paths;

use clap::Parser;
use color_eyre::eyre::Result;

use crate::atlas::run_atlas;
use crate::cli::{Cli, Commands};
use crate::organize::run_organize;
use crate::paths::run_dump;

fn main() -> Result<()> {
    color_eyre::install()?;
    let cli = Cli::parse();

    match cli.command {
        Commands::Dump { factorio_bin } => run_dump(factorio_bin),
        Commands::Organize {
            game_data,
            script_output,
            output,
        } => run_organize(&game_data, script_output, &output),
        Commands::Atlas {
            input,
            output,
            max_size,
            padding,
        } => run_atlas(&input, &output, max_size, padding),
    }
}
