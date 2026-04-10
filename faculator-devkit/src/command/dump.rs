use std::path::PathBuf;
use std::process::Command;

use color_eyre::eyre::{Result, WrapErr, bail};

use crate::command::organize::run_organize;
use crate::common::paths::{detect_factorio_bin, detect_script_output, ensure_existing_file};

pub fn run_dump(
    factorio_bin: Option<PathBuf>,
    game_data: &std::path::Path,
    script_output: Option<PathBuf>,
    output: &std::path::Path,
) -> Result<()> {
    let bin = match factorio_bin {
        Some(path) => ensure_existing_file(&path, format!("指定的 Factorio 路径不存在: {}", path.display()))?,
        None => detect_factorio_bin()?,
    };

    eprintln!("Factorio: {}", bin.display());
    eprintln!("\n⏳ 正在导出图标精灵 (--dump-icon-sprites) ...");

    let status = Command::new(&bin)
        .arg("--dump-icon-sprites")
        .status()
        .wrap_err("启动 Factorio 失败")?;

    if !status.success() {
        bail!("Factorio --dump-icon-sprites 退出码: {:?}", status.code());
    }

    eprintln!("✅ Factorio --dump-icon-sprites 已完成");

    let detected_script_output = detect_script_output()?;
    eprintln!("\n📂 script-output: {}", detected_script_output.display());
    eprintln!("   将从该目录读取 sprite 并同步到项目图标目录");

    let organize_script_output = script_output.or(Some(detected_script_output));
    eprintln!("\n🧹 开始按 game-data.json 整理图标...");
    run_organize(game_data, organize_script_output, output)?;

    Ok(())
}
