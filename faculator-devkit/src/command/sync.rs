use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::thread;
use std::time::{Duration, UNIX_EPOCH};

use color_eyre::eyre::{Result, WrapErr};
use serde::Deserialize;
use walkdir::{DirEntry, WalkDir};

use crate::common::paths::{detect_factorio_mods_dir, detect_faculator_output_dir, ensure_existing_dir};

pub fn run_sync_mod(
    mod_src: &Path,
    mods_dir: Option<PathBuf>,
    mod_name: Option<&str>,
    watch: bool,
    interval_secs: u64,
) -> Result<()> {
    let source = ensure_existing_dir(mod_src, format!("mod 源目录不存在: {}", mod_src.display()))?;
    let mods_root = mods_dir.unwrap_or(detect_factorio_mods_dir()?);
    fs::create_dir_all(&mods_root).wrap_err_with(|| format!("创建 mods 目录失败: {}", mods_root.display()))?;

    let resolved_mod_name = match mod_name {
        Some(name) => name.to_owned(),
        None => detect_mod_name_from_info(&source)?,
    };
    let destination = mods_root.join(&resolved_mod_name);
    sync_mod_once(&source, &destination)?;

    if !watch {
        return Ok(());
    }

    eprintln!("\n👀 watch 模式已启动: {}", source.display());
    let sleep_secs = interval_secs.max(1);
    let mut previous_snapshot = snapshot_mod_source(&source)?;

    loop {
        thread::sleep(Duration::from_secs(sleep_secs));
        let current_snapshot = snapshot_mod_source(&source)?;
        if current_snapshot != previous_snapshot {
            eprintln!("\n🔄 检测到 mod 文件变化，重新同步...");
            sync_mod_once(&source, &destination)?;
            previous_snapshot = current_snapshot;
        }
    }
}

pub fn run_sync_data(script_output: Option<PathBuf>, output: &Path) -> Result<()> {
    let source = match script_output {
        Some(path) => ensure_existing_dir(&path, format!("script-output 目录不存在: {}", path.display()))?,
        None => detect_faculator_output_dir()?,
    };

    fs::create_dir_all(output).wrap_err_with(|| format!("创建导出目标目录失败: {}", output.display()))?;

    eprintln!("📥 同步导出数据");
    eprintln!("   源目录: {}", source.display());
    eprintln!("   目标目录: {}", output.display());

    let copied_files = sync_data_once(&source, output)?;

    eprintln!("✅ 数据同步完成，共复制 {} 个文件", copied_files);

    Ok(())
}

fn sync_mod_once(source: &Path, destination: &Path) -> Result<()> {
    eprintln!("🔄 同步 mod");
    eprintln!("   {} -> {}", source.display(), destination.display());

    let seen = copy_tree(source, destination, should_skip_mod_entry)?;
    remove_destination_extras(destination, &seen, |_| false)?;

    eprintln!("✅ mod 同步完成");
    Ok(())
}

fn sync_data_once(source: &Path, destination: &Path) -> Result<usize> {
    let seen = copy_tree(source, destination, should_skip_data_entry)?;

    let copied_files = seen.iter().filter(|relative| destination.join(relative).is_file()).count();

    Ok(copied_files)
}

fn copy_tree(source: &Path, destination: &Path, should_skip: fn(&DirEntry) -> bool) -> Result<BTreeSet<PathBuf>> {
    let mut seen = BTreeSet::new();

    for entry in WalkDir::new(source).into_iter().filter_entry(|entry| !should_skip(entry)) {
        let entry = entry?;
        if entry.path() == source || should_skip(&entry) {
            continue;
        }

        let relative = entry
            .path()
            .strip_prefix(source)
            .wrap_err_with(|| format!("计算相对路径失败: {}", entry.path().display()))?
            .to_path_buf();
        let target = destination.join(&relative);

        seen.insert(relative);

        if entry.file_type().is_dir() {
            fs::create_dir_all(&target).wrap_err_with(|| format!("创建目录失败: {}", target.display()))?;
            continue;
        }

        if entry.file_type().is_file() {
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent).wrap_err_with(|| format!("创建目录失败: {}", parent.display()))?;
            }
            fs::copy(entry.path(), &target)
                .wrap_err_with(|| format!("复制文件失败: {} -> {}", entry.path().display(), target.display()))?;
            eprintln!("   ✅ {}", target.display());
        }
    }

    Ok(seen)
}

fn remove_destination_extras(destination: &Path, seen: &BTreeSet<PathBuf>, preserve: fn(&Path) -> bool) -> Result<()> {
    if !destination.exists() {
        return Ok(());
    }

    for entry in WalkDir::new(destination).min_depth(1).contents_first(true) {
        let entry = entry?;
        let relative = entry
            .path()
            .strip_prefix(destination)
            .wrap_err_with(|| format!("计算相对路径失败: {}", entry.path().display()))?;

        if preserve(relative) || seen.contains(relative) {
            continue;
        }

        remove_path(entry.path())?;
        eprintln!("   🧹 删除旧文件: {}", entry.path().display());
    }

    Ok(())
}

fn remove_path(path: &Path) -> Result<()> {
    let metadata = fs::symlink_metadata(path).wrap_err_with(|| format!("读取路径元数据失败: {}", path.display()))?;

    if metadata.is_dir() {
        fs::remove_dir_all(path).wrap_err_with(|| format!("删除目录失败: {}", path.display()))?;
    } else {
        fs::remove_file(path).wrap_err_with(|| format!("删除文件失败: {}", path.display()))?;
    }

    Ok(())
}

fn snapshot_mod_source(source: &Path) -> Result<BTreeMap<PathBuf, (bool, u64, u128)>> {
    let mut snapshot = BTreeMap::new();

    for entry in WalkDir::new(source)
        .into_iter()
        .filter_entry(|entry| !should_skip_mod_entry(entry))
    {
        let entry = entry?;
        if entry.path() == source || should_skip_mod_entry(&entry) {
            continue;
        }

        let relative = entry
            .path()
            .strip_prefix(source)
            .wrap_err_with(|| format!("计算相对路径失败: {}", entry.path().display()))?
            .to_path_buf();
        let metadata = entry.metadata()?;
        let modified = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map(|duration| duration.as_nanos())
            .unwrap_or(0);

        snapshot.insert(relative, (metadata.is_dir(), metadata.len(), modified));
    }

    Ok(snapshot)
}

fn should_skip_mod_entry(entry: &DirEntry) -> bool {
    let name = entry.file_name().to_string_lossy();
    name == ".git" || name == ".DS_Store" || name.ends_with(".bak")
}

fn should_skip_data_entry(entry: &DirEntry) -> bool {
    let name = entry.file_name().to_string_lossy();
    name == ".DS_Store"
}

#[derive(Deserialize)]
struct FactorioModInfo {
    name: String,
}

fn detect_mod_name_from_info(source: &Path) -> Result<String> {
    let info_path = source.join("info.json");
    let content =
        fs::read_to_string(&info_path).wrap_err_with(|| format!("读取 mod info.json 失败: {}", info_path.display()))?;
    let info: FactorioModInfo =
        serde_json::from_str(&content).wrap_err_with(|| format!("解析 mod info.json 失败: {}", info_path.display()))?;
    Ok(info.name)
}
