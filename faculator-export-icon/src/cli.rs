use std::path::PathBuf;

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "export-icon", about = "从 Factorio 游戏数据中提取原型图标")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// 使用 Factorio CLI 导出图标精灵和 data.raw
    Dump {
        /// Factorio 可执行文件路径（默认自动检测 macOS Steam 安装）
        #[arg(long)]
        factorio_bin: Option<PathBuf>,
    },
    /// 将导出的图标按 game-data.json 中的原型分类组织
    Organize {
        /// game-data.json 路径
        #[arg(long, default_value = "assets/exported/game-data.json")]
        game_data: PathBuf,

        /// Factorio script-output 目录（默认自动检测 macOS）
        #[arg(long)]
        script_output: Option<PathBuf>,

        /// 输出目录
        #[arg(long, short, default_value = "assets/icons")]
        output: PathBuf,
    },
    /// 将 assets/icons 中的已整理图标按尺寸分组打包为 atlas PNG 和 manifest
    Atlas {
        /// 图标输入目录（默认使用已整理过的 assets/icons）
        #[arg(long, default_value = "assets/icons")]
        input: PathBuf,

        /// atlas 输出目录
        #[arg(long, short, default_value = "assets/icon-atlas")]
        output: PathBuf,

        /// atlas 单页最大边长，不够时会自动分页
        #[arg(long, default_value_t = 4096)]
        max_size: u32,

        /// 图标之间的像素间距
        #[arg(long, default_value_t = 2)]
        padding: u32,
    },
}
