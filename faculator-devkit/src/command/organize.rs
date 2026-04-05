use std::path::{Path, PathBuf};

use color_eyre::eyre::{Result, WrapErr};

use crate::common::matching::{MatchedIcon, prepare_match_report, print_match_stats};

pub fn run_organize(game_data: &Path, script_output: Option<PathBuf>, output: &Path) -> Result<()> {
    eprintln!("📖 读取 game-data.json: {}", game_data.display());
    let prepared = prepare_match_report(game_data, script_output)?;
    eprintln!("   共 {} 个原型", prepared.total_prototypes);
    eprintln!("🔍 扫描图标: {}", prepared.script_output_dir.display());
    eprintln!("   发现 {} 个图标 PNG", prepared.discovered_icon_count);

    print_match_stats(&prepared.report);

    for icon in &prepared.report.matched_icons {
        copy_matched_icon(icon, output)?;
    }

    eprintln!("\n📦 导出完成:");
    eprintln!("   输出目录: {}", output.display());
    eprintln!("   成功: {}", prepared.report.total_matched());
    if prepared.report.total_missing() > 0 {
        eprintln!("   缺失: {}", prepared.report.total_missing());
    }

    Ok(())
}

fn copy_matched_icon(icon: &MatchedIcon, output_root: &Path) -> Result<()> {
    let output_dir = output_root.join(&icon.category);
    std::fs::create_dir_all(&output_dir).wrap_err_with(|| format!("创建输出目录失败: {}", output_dir.display()))?;

    let destination = output_dir.join(format!("{}.png", icon.name));
    std::fs::copy(&icon.source_path, &destination).wrap_err_with(|| {
        format!(
            "复制图标失败: {} → {}",
            icon.source_path.display(),
            destination.display()
        )
    })?;

    Ok(())
}

