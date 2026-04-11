use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use color_eyre::eyre::Result;

pub struct FoundIcon {
    pub proto_type: String,
    pub name: String,
    pub path: PathBuf,
}

pub type IconIndex<'a> = HashMap<(&'a str, &'a str), &'a Path>;

/// 扫描 script-output 目录中的 dump-icon-sprites 输出
///
/// Factorio 的 --dump-icon-sprites 输出格式为:
///   script-output/{type}.{name}.png
/// 例如: item.iron-plate.png, fluid.water.png
pub fn scan_icon_sprites(script_output: &Path) -> Result<Vec<FoundIcon>> {
    let mut icons = scan_flat_icon_files(script_output)?;

    if icons.is_empty() {
        icons = scan_nested_icon_files(script_output)?;
    }

    Ok(icons)
}

pub fn build_icon_index(icons: &[FoundIcon]) -> IconIndex<'_> {
    icons
        .iter()
        .map(|icon| ((icon.proto_type.as_str(), icon.name.as_str()), icon.path.as_path()))
        .collect()
}

fn scan_flat_icon_files(script_output: &Path) -> Result<Vec<FoundIcon>> {
    let mut icons = Vec::new();

    if let Ok(entries) = fs::read_dir(script_output) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(icon) = parse_flat_icon_path(&path) {
                icons.push(icon);
            }
        }
    }

    Ok(icons)
}

fn scan_nested_icon_files(script_output: &Path) -> Result<Vec<FoundIcon>> {
    let mut icons = Vec::new();

    for entry in walkdir::WalkDir::new(script_output).min_depth(2).max_depth(2) {
        let entry = entry?;
        let path = entry.path();

        if path.extension().and_then(|ext| ext.to_str()) != Some("png") {
            continue;
        }

        let Some(proto_type) = path
            .parent()
            .and_then(|parent| parent.file_name())
            .and_then(|name| name.to_str())
        else {
            continue;
        };

        if proto_type == "faculator" {
            continue;
        }

        let Some(name) = path.file_stem().and_then(|stem| stem.to_str()) else {
            continue;
        };

        icons.push(FoundIcon {
            proto_type: proto_type.to_string(),
            name: name.to_string(),
            path: path.to_path_buf(),
        });
    }

    Ok(icons)
}

fn parse_flat_icon_path(path: &Path) -> Option<FoundIcon> {
    if path.extension().and_then(|ext| ext.to_str()) != Some("png") {
        return None;
    }

    let stem = path.file_stem()?.to_str()?;
    let dot_index = stem.find('.')?;

    let proto_type = &stem[..dot_index];
    let name = &stem[dot_index + 1..];

    if proto_type.is_empty() || name.is_empty() {
        return None;
    }

    Some(FoundIcon {
        proto_type: proto_type.to_string(),
        name: name.to_string(),
        path: path.to_path_buf(),
    })
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::parse_flat_icon_path;

    #[test]
    fn parse_flat_icon_path_accepts_type_and_name() {
        let icon = parse_flat_icon_path(Path::new("item.iron-plate.png")).unwrap();

        assert_eq!(icon.proto_type, "item");
        assert_eq!(icon.name, "iron-plate");
    }

    #[test]
    fn parse_flat_icon_path_rejects_non_png_files() {
        assert!(parse_flat_icon_path(Path::new("item.iron-plate.jpg")).is_none());
    }
}
