use std::path::{Path, PathBuf};

use color_eyre::eyre::{Result, bail};

use crate::common::game_data::{PrototypeNames, load_prototype_names};
use crate::common::icons::{FoundIcon, IconIndex, build_icon_index, scan_icon_sprites};
use crate::common::paths::detect_script_output;

const CATEGORY_MAP: &[(&str, &str)] = &[
    ("item", "item"),
    ("fluid", "fluid"),
    ("recipe", "recipe"),
    ("technology", "technology"),
    ("entity", "entity"),
    ("equipment", "equipment"),
    ("quality", "quality"),
    ("space_location", "space-location"),
    ("space_connection", "space-connection"),
    ("item_group", "item-group"),
];

const ENTITY_ALT_TYPES: &[&str] = &[
    "assembling-machine",
    "furnace",
    "rocket-silo",
    "mining-drill",
    "offshore-pump",
    "boiler",
    "generator",
    "reactor",
    "solar-panel",
    "accumulator",
    "beacon",
    "lab",
    "agricultural-tower",
    "cargo-landing-pad",
    "space-platform-hub",
];

pub struct PreparedMatchReport {
    pub script_output_dir: PathBuf,
    pub discovered_icon_count: usize,
    pub total_prototypes: usize,
    pub report: MatchReport,
}

pub struct MatchReport {
    pub matched_icons: Vec<MatchedIcon>,
    pub category_stats: Vec<CategoryMatchStats>,
}

impl MatchReport {
    pub fn total_matched(&self) -> usize {
        self.category_stats.iter().map(|stats| stats.found).sum()
    }

    pub fn total_missing(&self) -> usize {
        self.category_stats.iter().map(|stats| stats.missing_names.len()).sum()
    }
}

pub struct MatchedIcon {
    pub category: String,
    pub name: String,
    pub source_path: PathBuf,
}

pub struct CategoryMatchStats {
    pub category: String,
    pub total: usize,
    pub found: usize,
    pub missing_names: Vec<String>,
}

pub fn prepare_match_report(game_data: &Path, script_output: Option<PathBuf>) -> Result<PreparedMatchReport> {
    let prototype_names = load_prototype_names(game_data)?;
    let total_prototypes = prototype_names.values().map(|names| names.len()).sum();

    let script_output_dir = script_output.unwrap_or(detect_script_output()?);
    let icons = scan_icon_sprites(&script_output_dir)?;

    if icons.is_empty() {
        bail!(
            "在 {} 中未找到图标文件\n\
             请先执行 `export-icon dump` 生成图标，或检查路径是否正确",
            script_output_dir.display()
        );
    }

    let report = build_match_report(&prototype_names, &icons);

    Ok(PreparedMatchReport {
        script_output_dir,
        discovered_icon_count: icons.len(),
        total_prototypes,
        report,
    })
}

pub fn print_match_stats(report: &MatchReport) {
    eprintln!("\n📊 匹配统计:");

    for stats in &report.category_stats {
        let status = if stats.missing_names.is_empty() {
            "✅".to_string()
        } else {
            format!("⚠️  缺失 {}", stats.missing_names.len())
        };

        eprintln!("   {:<16} {}/{} {}", stats.category, stats.found, stats.total, status);

        if !stats.missing_names.is_empty() && stats.missing_names.len() <= 10 {
            for missing_name in &stats.missing_names {
                eprintln!("      ❌ {missing_name}");
            }
        }
    }
}

fn build_match_report(prototype_names: &PrototypeNames, icons: &[FoundIcon]) -> MatchReport {
    let icon_index = build_icon_index(icons);
    let mut matched_icons = Vec::new();
    let mut category_stats = Vec::new();

    for &(game_data_category, output_category) in CATEGORY_MAP {
        let Some(names) = prototype_names.get(game_data_category) else {
            continue;
        };

        if names.is_empty() {
            continue;
        }

        let mut ordered_names = names.iter().cloned().collect::<Vec<_>>();
        ordered_names.sort();

        let mut found = 0usize;
        let mut missing_names = Vec::new();

        for name in ordered_names {
            if let Some(source_path) = find_icon_source(&icon_index, output_category, &name) {
                matched_icons.push(MatchedIcon {
                    category: output_category.to_string(),
                    name,
                    source_path: source_path.to_path_buf(),
                });
                found += 1;
            } else {
                missing_names.push(name);
            }
        }

        category_stats.push(CategoryMatchStats {
            category: output_category.to_string(),
            total: names.len(),
            found,
            missing_names,
        });
    }

    MatchReport {
        matched_icons,
        category_stats,
    }
}

fn find_icon_source<'a>(icon_index: &'a IconIndex<'_>, dump_type: &str, name: &str) -> Option<&'a Path> {
    icon_index.get(&(dump_type, name)).copied().or_else(|| {
        candidate_dump_types(dump_type)
            .iter()
            .find_map(|candidate_type| icon_index.get(&(*candidate_type, name)).copied())
    })
}

fn candidate_dump_types(dump_type: &str) -> &'static [&'static str] {
    match dump_type {
        "entity" => ENTITY_ALT_TYPES,
        _ => &[],
    }
}

#[cfg(test)]
mod tests {
    use std::collections::{HashMap, HashSet};
    use std::path::{Path, PathBuf};

    use super::{build_match_report, find_icon_source};
    use crate::common::icons::{FoundIcon, IconIndex};

    #[test]
    fn find_icon_source_uses_entity_fallback_types() {
        let mut index: IconIndex<'_> = HashMap::new();
        index.insert(
            ("assembling-machine", "assembling-machine-1"),
            Path::new("assembling-machine.assembling-machine-1.png"),
        );

        let source = find_icon_source(&index, "entity", "assembling-machine-1");

        assert_eq!(source, Some(Path::new("assembling-machine.assembling-machine-1.png")));
    }

    #[test]
    fn find_icon_source_prefers_direct_type_match() {
        let mut index: IconIndex<'_> = HashMap::new();
        index.insert(("item", "iron-plate"), Path::new("item.iron-plate.png"));

        let source = find_icon_source(&index, "item", "iron-plate");

        assert_eq!(source, Some(Path::new("item.iron-plate.png")));
    }

    #[test]
    fn build_match_report_uses_sprite_key_categories() {
        let prototype_names = HashMap::from([("item".to_string(), HashSet::from([String::from("iron-plate")]))]);
        let icons = vec![FoundIcon {
            proto_type: "item".to_string(),
            name: "iron-plate".to_string(),
            path: PathBuf::from("item.iron-plate.png"),
        }];

        let report = build_match_report(&prototype_names, &icons);

        assert_eq!(report.matched_icons.len(), 1);
        assert_eq!(report.matched_icons[0].category, "item");
        assert_eq!(report.matched_icons[0].name, "iron-plate");
        assert_eq!(report.total_matched(), 1);
    }
}

