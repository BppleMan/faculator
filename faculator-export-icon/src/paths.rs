use std::path::{Path, PathBuf};
use std::process::Command;

use color_eyre::eyre::{Result, WrapErr, bail};

pub fn home_dir() -> Result<PathBuf> {
    dirs::home_dir().ok_or_else(|| color_eyre::eyre::eyre!("无法获取 HOME 目录"))
}

/// 自动检测 Factorio 可执行文件路径（macOS 优先级：Steam > standalone）
pub fn detect_factorio_bin() -> Result<PathBuf> {
    let home = home_dir()?;
    let candidates = [
        home.join("Library/Application Support/Steam/steamapps/common/Factorio/factorio.app/Contents/MacOS/factorio"),
        PathBuf::from("/Applications/factorio.app/Contents/MacOS/factorio"),
    ];

    for path in &candidates {
        if path.exists() {
            return Ok(path.clone());
        }
    }

    bail!(
        "未找到 Factorio 可执行文件，请用 --factorio-bin 指定路径\n搜索过的位置:\n{}",
        candidate_list(&candidates)
    );
}

/// 自动检测 script-output 目录
pub fn detect_script_output() -> Result<PathBuf> {
    let path = home_dir()?.join("Library/Application Support/factorio/script-output");
    ensure_existing_dir(
        &path,
        format!(
            "未找到 Factorio script-output 目录: {}\n请先执行 `export-icon dump` 或用 --script-output 指定路径",
            path.display()
        ),
    )
}

pub fn run_dump(factorio_bin: Option<PathBuf>) -> Result<()> {
    let bin = match factorio_bin {
        Some(path) => ensure_existing_file(&path, format!("指定的 Factorio 路径不存在: {}", path.display()))?,
        None => detect_factorio_bin()?,
    };

    eprintln!("Factorio: {}", bin.display());
    eprintln!("\n⏳ 正在导出数据和图标精灵 (--dump-data) ...");

    let status = Command::new(&bin).arg("--dump-data").status().wrap_err("启动 Factorio 失败")?;

    if !status.success() {
        bail!("Factorio --dump-data 退出码: {:?}", status.code());
    }

    eprintln!("✅ 导出完成");

    let output_dir = detect_script_output()?;
    eprintln!("\n📂 导出目录: {}", output_dir.display());

    Ok(())
}

fn ensure_existing_file(path: &Path, error_message: String) -> Result<PathBuf> {
    if path.exists() {
        Ok(path.to_path_buf())
    } else {
        bail!(error_message);
    }
}

fn ensure_existing_dir(path: &Path, error_message: String) -> Result<PathBuf> {
    if path.exists() {
        Ok(path.to_path_buf())
    } else {
        bail!(error_message);
    }
}

fn candidate_list(candidates: &[PathBuf]) -> String {
    candidates
        .iter()
        .map(|path| format!("  {}", path.display()))
        .collect::<Vec<_>>()
        .join("\n")
}
