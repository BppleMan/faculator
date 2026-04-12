use crate::command::atlas::AtlasCommand;
use crate::command::codegen::CodegenCommand;
use crate::command::dump::DumpCommand;
use crate::command::sync::SyncCommand;
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "facx", about = "Faculator 开发工具")]
pub struct Cli {
    #[command(subcommand)]
    pub command: SubCommand,
}

#[derive(Subcommand)]
pub enum SubCommand {
    /// 同步 mod 或导出数据
    Sync(SyncCommand),
    /// 使用 Factorio CLI 导出 sprite，并按 game-data.json 同步整理到项目中
    Dump(DumpCommand),
    /// 将 assets/icons 中的已整理图标按尺寸分组打包为 atlas PNG 和 manifest
    Atlas(AtlasCommand),
    /// 将导出数据显式生成到仓库源码中
    Codegen(CodegenCommand),
}
