use std::path::PathBuf;

use clap::{Parser, Subcommand, ValueEnum};

#[derive(Clone, Copy, Debug, Eq, PartialEq, ValueEnum)]
pub enum SyncTarget {
    Mod,
    Data,
}

#[derive(Parser)]
#[command(name = "devkit", about = "Faculator 开发工具")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// 使用 Factorio CLI 导出 sprite，并按 game-data.json 同步整理到项目中
    Dump {
        /// Factorio 可执行文件路径（默认自动检测 macOS Steam 安装）
        #[arg(long)]
        factorio_bin: Option<PathBuf>,

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
    /// 同步 mod 或导出数据
    Sync {
        /// 同步目标：`mod` 部署 mod 到 Factorio mods 目录，`data` 同步导出数据到 assets
        #[arg(value_enum)]
        target: SyncTarget,

        /// mod 源目录
        #[arg(long, default_value = "mods/faculator-expoter", help_heading = "Mod Sync")]
        mod_src: PathBuf,

        /// 目标 mods 目录（默认自动检测）
        #[arg(long, help_heading = "Mod Sync")]
        mods_dir: Option<PathBuf>,

        /// 部署后的 mod 目录名；默认从 info.json 的 `name` 自动推导
        #[arg(long, help_heading = "Mod Sync")]
        mod_name: Option<String>,

        /// 持续监听源目录变化并自动重新同步
        #[arg(long, help_heading = "Mod Sync")]
        watch: bool,

        /// watch 模式轮询间隔（秒）
        #[arg(long, default_value_t = 1, help_heading = "Mod Sync")]
        interval_secs: u64,

        /// faculator 导出目录；默认自动检测 Factorio 的 script-output/faculator
        #[arg(long, help_heading = "Data Sync")]
        script_output: Option<PathBuf>,

        /// 数据同步目标目录
        #[arg(long, short, default_value = "assets/exported", help_heading = "Data Sync")]
        output: PathBuf,
    },
    /// 根据导出的 game-data.json 生成项目代码
    Gen {
        #[command(subcommand)]
        command: GenCommands,
    },
}

#[derive(Subcommand)]
pub enum GenCommands {
    /// 生成 faculator-core 的各类 xxx_category 枚举与 category 模块导出
    Category {
        /// game-data.json 路径
        #[arg(long, default_value = "assets/exported/game-data.json")]
        game_data: PathBuf,

        /// 输出目录（会写入 *_category.rs）
        #[arg(long, default_value = "faculator-core/src/category")]
        output_dir: PathBuf,

        /// category.rs 模块导出文件路径
        #[arg(long, default_value = "faculator-core/src/category.rs")]
        category_mod: PathBuf,
    },
}
