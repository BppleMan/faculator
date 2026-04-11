use std::collections::{BTreeMap, BTreeSet, HashSet};
use std::fs;
use std::path::Path;

use crate::command::Commander;
use crate::common::config;
use clap::{Args, Subcommand};
use color_eyre::eyre::{Result, WrapErr, bail};
use serde_json::Value;

#[derive(Debug, Clone, Args)]
pub struct GenCommand {
    #[command(subcommand)]
    command: GenSubcommand,
}

impl Commander for GenCommand {
    fn execute(&self) -> Result<()> {
        match &self.command {
            GenSubcommand::Category(command) => command.execute(),
        }
    }
}

#[derive(Debug, Clone, Subcommand)]
pub enum GenSubcommand {
    /// 生成 faculator-core 的各类 xxx_category 枚举与 category 模块导出
    Category(GenCategoryCommand),
}

#[derive(Debug, Clone, Args)]
pub struct GenCategoryCommand {
    /// 输出目录（会写入 *_category.rs）
    #[arg(long, default_value = "faculator-core/src/category")]
    output_dir: std::path::PathBuf,

    /// category.rs 模块导出文件路径
    #[arg(long, default_value = "faculator-core/src/category.rs")]
    category_mod: std::path::PathBuf,
}

impl Commander for GenCategoryCommand {
    fn execute(&self) -> Result<()> {
        self.run(config::game_data_path())
    }
}

impl GenCategoryCommand {
    fn run(&self, game_data: &Path) -> Result<()> {
        eprintln!("📖 读取 game-data.json: {}", game_data.display());
        let content = fs::read_to_string(game_data).wrap_err_with(|| format!("读取失败: {}", game_data.display()))?;
        let root: Value = serde_json::from_str(&content).wrap_err("解析 game-data.json 失败")?;

        let object = root
            .as_object()
            .ok_or_else(|| color_eyre::eyre::eyre!("game-data.json 顶层必须是对象"))?;

        let mut specs = Vec::new();

        for (key, value) in object {
            let Some(stem) = key.strip_suffix("_categories") else {
                continue;
            };

            let names = self.collect_category_names(key, value)?;
            if names.is_empty() {
                continue;
            }

            specs.push(CategorySpec::new(stem, names, self));
        }

        specs.sort_by(|left, right| left.module_name.cmp(&right.module_name));

        if specs.is_empty() {
            bail!("在 {} 中未发现任何 *_categories 字段", game_data.display());
        }

        fs::create_dir_all(&self.output_dir).wrap_err_with(|| format!("创建目录失败: {}", self.output_dir.display()))?;

        let mut generated_files = HashSet::new();

        for spec in &specs {
            let file_name = format!("{}.rs", spec.module_name);
            let file_path = self.output_dir.join(&file_name);
            generated_files.insert(file_name);

            let content = self.render_category_file(spec);
            fs::write(&file_path, content).wrap_err_with(|| format!("写入文件失败: {}", file_path.display()))?;
            eprintln!("   ✅ {}", file_path.display());
        }

        self.cleanup_stale_category_files(&generated_files)?;

        let mod_content = self.render_category_mod_file(&specs);
        fs::write(&self.category_mod, mod_content)
            .wrap_err_with(|| format!("写入文件失败: {}", self.category_mod.display()))?;

        eprintln!("✅ category 代码生成完成");
        eprintln!("   枚举文件: {}", specs.len());
        eprintln!("   模块导出: {}", self.category_mod.display());

        Ok(())
    }

    fn collect_category_names(&self, key: &str, value: &Value) -> Result<BTreeSet<String>> {
        let array = value
            .as_array()
            .ok_or_else(|| color_eyre::eyre::eyre!("字段 {key} 不是数组，无法生成枚举"))?;

        let mut names = BTreeSet::new();

        for entry in array {
            let Some(name) = entry.get("name").and_then(Value::as_str) else {
                continue;
            };

            if !name.trim().is_empty() {
                names.insert(name.to_string());
            }
        }

        Ok(names)
    }

    fn render_category_file(&self, spec: &CategorySpec) -> String {
        let mut out = String::new();
        out.push_str("#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]\n");
        out.push_str(&format!("pub enum {} {{\n", spec.enum_name));

        for variant in &spec.variants {
            out.push_str(&format!("    #[serde(rename = \"{}\")]\n", variant.category_name));
            out.push_str(&format!("    {},\n", variant.variant_name));
        }

        out.push_str("}\n\n");
        out.push_str(&format!("impl {} {{\n", spec.enum_name));
        out.push_str("    pub const fn category_name(self) -> &'static str {\n");
        out.push_str("        match self {\n");

        for variant in &spec.variants {
            out.push_str(&format!(
                "            Self::{} => \"{}\",\n",
                variant.variant_name, variant.category_name
            ));
        }

        out.push_str("        }\n");
        out.push_str("    }\n");
        out.push_str("}\n");
        out
    }

    fn render_category_mod_file(&self, specs: &[CategorySpec]) -> String {
        let mut out = String::new();

        for spec in specs {
            out.push_str(&format!("mod {};\n", spec.module_name));
        }

        out.push('\n');

        for spec in specs {
            out.push_str(&format!("pub use {}::*;\n", spec.module_name));
        }

        out
    }

    fn cleanup_stale_category_files(&self, generated_files: &HashSet<String>) -> Result<()> {
        for entry in fs::read_dir(&self.output_dir)
            .wrap_err_with(|| format!("读取目录失败: {}", self.output_dir.display()))?
        {
            let entry = entry?;
            let path = entry.path();

            if !entry.file_type()?.is_file() {
                continue;
            }

            let Some(file_name) = path.file_name().and_then(|name| name.to_str()) else {
                continue;
            };

            if !file_name.ends_with("_category.rs") {
                continue;
            }

            if generated_files.contains(file_name) {
                continue;
            }

            fs::remove_file(&path).wrap_err_with(|| format!("删除旧文件失败: {}", path.display()))?;
            eprintln!("   🧹 删除旧文件: {}", path.display());
        }

        Ok(())
    }

    fn to_upper_camel(&self, value: &str) -> String {
        let mut out = String::new();

        for part in value
            .split(|ch: char| !ch.is_ascii_alphanumeric())
            .filter(|part| !part.is_empty())
        {
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                out.push(first.to_ascii_uppercase());
                for ch in chars {
                    out.push(ch.to_ascii_lowercase());
                }
            }
        }

        out
    }

    fn to_kebab_case(&self, value: &str) -> String {
        let mut out = String::new();

        for (index, part) in value
            .split(|ch: char| !ch.is_ascii_alphanumeric())
            .filter(|part| !part.is_empty())
            .enumerate()
        {
            if index > 0 {
                out.push('-');
            }
            out.push_str(&part.to_ascii_lowercase());
        }

        out
    }
}

struct CategorySpec {
    module_name: String,
    enum_name: String,
    variants: Vec<CategoryVariant>,
}

impl CategorySpec {
    fn new(stem: &str, names: BTreeSet<String>, command: &GenCategoryCommand) -> Self {
        let module_name = format!("{}_category", stem);
        let enum_name = format!("{}Category", command.to_upper_camel(stem));

        let mut used = BTreeMap::<String, usize>::new();
        let mut variants = Vec::new();

        for name in names {
            let mut variant_name = command.to_upper_camel(&name);
            if variant_name.is_empty() {
                variant_name = String::from("Unknown");
            }
            if variant_name.chars().next().is_some_and(|ch| ch.is_ascii_digit()) {
                variant_name = format!("N{variant_name}");
            }

            let duplicate_index = used.entry(variant_name.clone()).or_insert(0);
            if *duplicate_index > 0 {
                variant_name = format!("{}{}", variant_name, duplicate_index);
            }
            *duplicate_index += 1;

            variants.push(CategoryVariant {
                variant_name,
                category_name: command.to_kebab_case(&name),
            });
        }

        Self {
            module_name,
            enum_name,
            variants,
        }
    }
}

struct CategoryVariant {
    variant_name: String,
    category_name: String,
}

#[cfg(test)]
mod tests {
    use super::GenCategoryCommand;

    #[test]
    fn to_upper_camel_handles_kebab_and_underscore_names() {
        let command = GenCategoryCommand {
            output_dir: "faculator-core/src/category".into(),
            category_mod: "faculator-core/src/category.rs".into(),
        };
        assert_eq!(command.to_upper_camel("chemistry-or-cryogenics"), "ChemistryOrCryogenics");
        assert_eq!(command.to_upper_camel("basic_solid"), "BasicSolid");
    }

    #[test]
    fn to_kebab_case_normalizes_common_formats() {
        let command = GenCategoryCommand {
            output_dir: "faculator-core/src/category".into(),
            category_mod: "faculator-core/src/category.rs".into(),
        };
        assert_eq!(command.to_kebab_case("basic-solid"), "basic-solid");
        assert_eq!(command.to_kebab_case("basic_solid"), "basic-solid");
    }
}
