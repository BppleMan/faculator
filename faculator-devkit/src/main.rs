mod cli;
mod command;
mod common;

use clap::Parser;
use color_eyre::eyre::Result;

use crate::cli::{Cli, Commands, GenCommands, SyncCommands};
use crate::command::atlas::run_atlas;
use crate::command::dump::run_dump;
use crate::command::generate::run_gen_category;
use crate::command::sync::{run_sync_data, run_sync_mod};

fn main() -> Result<()> {
    color_eyre::install()?;
    let cli = Cli::parse();

    match cli.command {
        Commands::Dump {
            factorio_bin,
            game_data,
            script_output,
            output,
        } => run_dump(factorio_bin, &game_data, script_output, &output),
        Commands::Atlas {
            input,
            output,
            max_size,
            padding,
        } => run_atlas(&input, &output, max_size, padding),
        Commands::Gen { command } => match command {
            GenCommands::Category {
                game_data,
                output_dir,
                category_mod,
            } => run_gen_category(&game_data, &output_dir, &category_mod),
        },
        Commands::Sync { command } => match command {
            SyncCommands::Mod {
                mod_src,
                mods_dir,
                mod_name,
                watch,
                interval_secs,
            } => run_sync_mod(&mod_src, mods_dir, &mod_name, watch, interval_secs),
            SyncCommands::Data { script_output, output } => run_sync_data(script_output, &output),
        },
    }
}
