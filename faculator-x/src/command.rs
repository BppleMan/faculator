pub mod atlas;
pub mod dump;
pub mod generate;
pub mod sync;

use crate::cli::SubCommand;
use color_eyre::Result;

pub trait Commander {
    fn execute(&self) -> Result<()>;
}

impl Commander for SubCommand {
    fn execute(&self) -> Result<()> {
        match self {
            Self::Dump(command) => command.execute(),
            Self::Atlas(command) => command.execute(),
            Self::Sync(command) => command.execute(),
            Self::Gen(command) => command.execute(),
        }
    }
}
