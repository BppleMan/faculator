use std::path::{Path, PathBuf};

use color_eyre::eyre::{Result, bail};

pub fn home_dir() -> Result<PathBuf> {
    dirs::home_dir().ok_or_else(|| color_eyre::eyre::eyre!("无法获取 HOME 目录"))
}

/// 自动检测 Factorio 可执行文件路径（Windows / macOS / Linux）。
pub fn detect_factorio_bin() -> Result<PathBuf> {
    let candidates = factorio_bin_candidates()?;
    find_existing_path(
        &candidates,
        "未找到 Factorio 可执行文件，请检查当前平台默认安装位置",
    )
}

/// 自动检测 script-output 目录（Windows / macOS / Linux）。
pub fn detect_script_output() -> Result<PathBuf> {
    let candidates = factorio_user_data_dir_candidates()?
        .into_iter()
        .map(|path| path.join("script-output"))
        .collect::<Vec<_>>();

    find_existing_path(
        &candidates,
        "未找到 Factorio script-output 目录，请先执行 `facx dump`",
    )
}

/// 自动检测 faculator exporter 的输出目录。
pub fn detect_faculator_output_dir() -> Result<PathBuf> {
    let candidates = factorio_user_data_dir_candidates()?
        .into_iter()
        .map(|path| path.join("script-output/faculator"))
        .collect::<Vec<_>>();

    find_existing_path(
        &candidates,
        "未找到 faculator 导出目录，请先在游戏里运行导出",
    )
}

/// 自动检测 Factorio mods 目录（Windows / macOS / Linux）。
pub fn detect_factorio_mods_dir() -> Result<PathBuf> {
    let candidates = factorio_user_data_dir_candidates()?
        .into_iter()
        .map(|path| path.join("mods"))
        .collect::<Vec<_>>();

    find_existing_path(&candidates, "未找到 Factorio mods 目录，请检查当前平台默认安装位置")
        .or_else(|_| candidates.first().cloned().ok_or_else(|| color_eyre::eyre::eyre!("无法推导 Factorio mods 目录")))
}

pub fn ensure_existing_dir(path: &Path, error_message: String) -> Result<PathBuf> {
    if path.is_dir() {
        Ok(path.to_path_buf())
    } else {
        bail!(error_message);
    }
}

fn factorio_bin_candidates() -> Result<Vec<PathBuf>> {
    let home = home_dir()?;

    let candidates = if cfg!(target_os = "windows") {
        vec![
            PathBuf::from(r"C:\Program Files (x86)\Steam\steamapps\common\Factorio\bin\x64\Factorio.exe"),
            PathBuf::from(r"C:\Program Files (x86)\Steam\steamapps\common\Factorio\bin\Win32\Factorio.exe"),
            PathBuf::from(r"C:\Program Files\Factorio\bin\x64\Factorio.exe"),
            PathBuf::from(r"C:\Program Files\Factorio\bin\Win32\Factorio.exe"),
        ]
    } else if cfg!(target_os = "macos") {
        vec![
            home.join("Library/Application Support/Steam/steamapps/common/Factorio/factorio.app/Contents/MacOS/factorio"),
            PathBuf::from("/Applications/factorio.app/Contents/MacOS/factorio"),
        ]
    } else {
        vec![
            home.join(".steam/steam/steamapps/common/Factorio/bin/x64/factorio"),
            home.join(".steam/steam/steamapps/common/Factorio/bin/factorio"),
            home.join(".local/share/Steam/steamapps/common/Factorio/bin/x64/factorio"),
            home.join(".local/share/Steam/steamapps/common/Factorio/bin/factorio"),
            home.join(".var/app/com.valvesoftware.Steam/.steam/steam/steamapps/common/Factorio/bin/x64/factorio"),
            home.join(".var/app/com.valvesoftware.Steam/.steam/steam/steamapps/common/Factorio/bin/factorio"),
            home.join(".factorio/bin/x64/factorio"),
            home.join(".factorio/bin/factorio"),
        ]
    };

    Ok(candidates)
}

fn factorio_user_data_dir_candidates() -> Result<Vec<PathBuf>> {
    let home = home_dir()?;

    let candidates = if cfg!(target_os = "windows") {
        let mut candidates = Vec::new();

        if let Some(appdata) = std::env::var_os("APPDATA") {
            candidates.push(PathBuf::from(appdata).join("Factorio"));
        }
        if let Some(config_dir) = dirs::config_dir() {
            candidates.push(config_dir.join("Factorio"));
        }

        candidates
    } else if cfg!(target_os = "macos") {
        vec![home.join("Library/Application Support/factorio")]
    } else {
        vec![
            home.join(".factorio"),
            home.join(".local/share/factorio"),
            home.join(".var/app/com.valvesoftware.Steam/.factorio"),
        ]
    };

    Ok(candidates)
}

fn find_existing_path(candidates: &[PathBuf], error_prefix: &str) -> Result<PathBuf> {
    for path in candidates {
        if path.exists() {
            return Ok(path.clone());
        }
    }

    bail!("{error_prefix}\n搜索过的位置:\n{}", candidate_list(candidates));
}

fn candidate_list(candidates: &[PathBuf]) -> String {
    candidates
        .iter()
        .map(|path| format!("  {}", path.display()))
        .collect::<Vec<_>>()
        .join("\n")
}
