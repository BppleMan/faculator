use std::path::{Path, PathBuf};

use color_eyre::eyre::{Result, bail};

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

pub fn detect_faculator_output_dir() -> Result<PathBuf> {
    let path = detect_script_output()?.join("faculator");
    ensure_existing_dir(
        &path,
        format!(
            "未找到 Faculator 导出目录: {}\n请先在游戏中执行导出，或用 --script-output 指定路径",
            path.display()
        ),
    )
}

pub fn detect_factorio_mods_dir() -> Result<PathBuf> {
    Ok(home_dir()?.join("Library/Application Support/factorio/mods"))
}

pub fn ensure_existing_file(path: &Path, error_message: String) -> Result<PathBuf> {
    if path.exists() {
        Ok(path.to_path_buf())
    } else {
        bail!(error_message);
    }
}

pub fn ensure_existing_dir(path: &Path, error_message: String) -> Result<PathBuf> {
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
