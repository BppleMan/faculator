use crate::command::Commander;
use crate::common::config;
use crate::common::matching::{MatchedIcon, prepare_match_report, print_match_stats};
use clap::Args;
use color_eyre::eyre::{Result, WrapErr, bail};
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone, Args)]
pub struct DumpCommand;

impl Commander for DumpCommand {
    fn execute(&self) -> Result<()> {
        let bin = config::factorio_bin()?;

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

        let detected_script_output = config::script_output_dir()?;
        eprintln!("\n📂 script-output: {}", detected_script_output.display());
        eprintln!("   将从该目录读取 sprite 并同步到项目图标目录");

        eprintln!("\n🧹 开始按 game-data.json 整理图标...");
        self.organize(
            config::game_data_path(),
            Some(detected_script_output),
            config::icons_dir(),
        )?;

        Ok(())
    }
}

impl DumpCommand {
    fn organize(&self, game_data: &Path, script_output: Option<PathBuf>, output: &Path) -> Result<()> {
        eprintln!("📖 读取 game-data.json: {}", game_data.display());
        let prepared = prepare_match_report(game_data, script_output)?;
        eprintln!("   共 {} 个原型", prepared.total_prototypes);
        eprintln!("🔍 扫描图标: {}", prepared.script_output_dir.display());
        eprintln!("   发现 {} 个图标 PNG", prepared.discovered_icon_count);

        print_match_stats(&prepared.report);

        for icon in &prepared.report.matched_icons {
            self.copy_matched_icon(icon, output)?;
        }

        eprintln!("\n📦 导出完成:");
        eprintln!("   输出目录: {}", output.display());
        eprintln!("   成功: {}", prepared.report.total_matched());
        if prepared.report.total_missing() > 0 {
            eprintln!("   缺失: {}", prepared.report.total_missing());
        }

        Ok(())
    }

    fn copy_matched_icon(&self, icon: &MatchedIcon, output_root: &Path) -> Result<()> {
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
}
