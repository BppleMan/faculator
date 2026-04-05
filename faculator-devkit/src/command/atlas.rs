use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use color_eyre::eyre::{Result, WrapErr, bail, eyre};
use image::{DynamicImage, GenericImage, RgbaImage, image_dimensions};
use serde::Serialize;
use texture_packer::importer::ImageImporter;
use texture_packer::texture::Texture;
use texture_packer::{MultiTexturePacker, TexturePacker, TexturePackerConfig};
use walkdir::WalkDir;

const SMALL_GROUP_THRESHOLD: usize = 10;

pub fn run_atlas(input: &Path, output: &Path, max_size: u32, padding: u32) -> Result<()> {
    eprintln!("📂 扫描图标源目录: {}", input.display());
    let icons = scan_curated_icons(input)?;

    if icons.is_empty() {
        bail!("在 {} 中未找到任何 PNG 图标", input.display());
    }

    let grouped_icons = group_icons_by_size(icons);
    print_size_group_stats(&grouped_icons);
    let atlas_groups = build_atlas_groups(grouped_icons);
    print_atlas_group_stats(&atlas_groups);

    reset_output_dir(output)?;

    let manifest = build_grouped_manifest(&atlas_groups, output, max_size, padding)?;
    let manifest_path = output.join("manifest.json");
    let manifest_json = serde_json::to_vec_pretty(&manifest).wrap_err("序列化 atlas manifest 失败")?;
    fs::write(&manifest_path, manifest_json)
        .wrap_err_with(|| format!("写入 atlas manifest 失败: {}", manifest_path.display()))?;

    let total_pages: usize = manifest.groups.values().map(|group| group.pages.len()).sum();
    let total_sprites: usize = manifest.groups.values().map(|group| group.sprites.len()).sum();

    eprintln!("\n🗂️  Atlas 导出完成:");
    eprintln!("   输出目录: {}", output.display());
    eprintln!("   尺寸组: {}", manifest.groups.len());
    eprintln!("   图页: {}", total_pages);
    eprintln!("   精灵: {}", total_sprites);

    Ok(())
}

fn scan_curated_icons(input: &Path) -> Result<Vec<CuratedIcon>> {
    let mut icons = Vec::new();

    for entry in WalkDir::new(input).min_depth(2) {
        let entry = entry?;
        let path = entry.path();

        if !entry.file_type().is_file() || path.extension().and_then(|ext| ext.to_str()) != Some("png") {
            continue;
        }

        let relative_path = path
            .strip_prefix(input)
            .wrap_err_with(|| format!("计算图标相对路径失败: {}", path.display()))?;
        let key = sprite_key_from_relative_path(relative_path)?;
        let (width, height) =
            image_dimensions(path).wrap_err_with(|| format!("读取图标尺寸失败: {}", path.display()))?;

        icons.push(CuratedIcon {
            key,
            source_path: path.to_path_buf(),
            width,
            height,
        });
    }

    icons.sort_by(|left, right| left.key.cmp(&right.key));

    Ok(icons)
}

fn sprite_key_from_relative_path(relative_path: &Path) -> Result<String> {
    let without_extension = relative_path.with_extension("");
    let key = without_extension.to_string_lossy().replace('\\', "/");

    if key.is_empty() || !key.contains('/') {
        bail!("图标路径必须至少包含一级分类目录: {}", relative_path.display());
    }

    Ok(key)
}

fn group_icons_by_size(icons: Vec<CuratedIcon>) -> BTreeMap<SizeKey, Vec<CuratedIcon>> {
    let mut grouped = BTreeMap::new();

    for icon in icons {
        grouped.entry(SizeKey::from_icon(&icon)).or_insert_with(Vec::new).push(icon);
    }

    for icons in grouped.values_mut() {
        icons.sort_by(|left, right| {
            right
                .area()
                .cmp(&left.area())
                .then_with(|| right.longest_edge().cmp(&left.longest_edge()))
                .then_with(|| left.key.cmp(&right.key))
        });
    }

    grouped
}

fn print_size_group_stats(grouped_icons: &BTreeMap<SizeKey, Vec<CuratedIcon>>) {
    eprintln!(
        "   共 {} 张图标，归为 {} 个尺寸组",
        grouped_icons.values().map(Vec::len).sum::<usize>(),
        grouped_icons.len()
    );
    eprintln!("\n📏 尺寸分组:");

    for (size, icons) in grouped_icons {
        eprintln!("   {:>4}x{:<4} {}", size.width, size.height, icons.len());
    }
}

fn build_atlas_groups(grouped_icons: BTreeMap<SizeKey, Vec<CuratedIcon>>) -> Vec<AtlasGroupInput> {
    let mut atlas_groups = Vec::new();
    let mut misc_icons = Vec::new();

    for (size, icons) in grouped_icons {
        if icons.len() < SMALL_GROUP_THRESHOLD {
            misc_icons.extend(icons);
        } else {
            atlas_groups.push(AtlasGroupInput {
                label: size.label(),
                uniform_size: Some(size),
                icons,
            });
        }
    }

    if !misc_icons.is_empty() {
        misc_icons.sort_by(|left, right| {
            right
                .area()
                .cmp(&left.area())
                .then_with(|| right.longest_edge().cmp(&left.longest_edge()))
                .then_with(|| left.key.cmp(&right.key))
        });

        atlas_groups.push(AtlasGroupInput {
            label: String::from("misc"),
            uniform_size: None,
            icons: misc_icons,
        });
    }

    atlas_groups.sort_by(|left, right| left.label.cmp(&right.label));
    atlas_groups
}

fn print_atlas_group_stats(atlas_groups: &[AtlasGroupInput]) {
    eprintln!("\n🗃️  图集分组:");

    for group in atlas_groups {
        match &group.uniform_size {
            Some(size) => eprintln!(
                "   {:<12} {} 张，同尺寸 {}x{}",
                group.label,
                group.icons.len(),
                size.width,
                size.height
            ),
            None => eprintln!(
                "   {:<12} {} 张，合并所有少于 {} 张的零散尺寸",
                group.label,
                group.icons.len(),
                SMALL_GROUP_THRESHOLD
            ),
        }
    }
}

fn reset_output_dir(output: &Path) -> Result<()> {
    if output.exists() {
        fs::remove_dir_all(output).wrap_err_with(|| format!("清理 atlas 输出目录失败: {}", output.display()))?;
    }

    fs::create_dir_all(output).wrap_err_with(|| format!("创建 atlas 输出目录失败: {}", output.display()))?;
    Ok(())
}

fn build_grouped_manifest(
    atlas_groups: &[AtlasGroupInput],
    output: &Path,
    max_size: u32,
    padding: u32,
) -> Result<AtlasManifest> {
    let mut groups = BTreeMap::new();

    for group in atlas_groups {
        let group_name = group.label.clone();
        eprintln!("\n🧩 打包尺寸组 {}:", group_name);

        let group_manifest = build_single_group_manifest(group, output, max_size, padding)?;
        groups.insert(group_name, group_manifest);
    }

    Ok(AtlasManifest {
        version: 2,
        source: String::from("curated-icons"),
        max_page_size: max_size,
        padding,
        groups,
    })
}

fn build_single_group_manifest(
    group: &AtlasGroupInput,
    output: &Path,
    max_size: u32,
    padding: u32,
) -> Result<AtlasGroupManifest> {
    let mut packer = MultiTexturePacker::new_skyline(texture_packer_config(max_size, padding));
    let mut source_paths = BTreeMap::new();

    for (index, icon) in group.icons.iter().enumerate() {
        if index % 100 == 0 || index + 1 == group.icons.len() {
            eprintln!("   打包进度: {}/{}", index + 1, group.icons.len());
        }

        let texture = ImageImporter::import_from_file(&icon.source_path)
            .map_err(|error| eyre!("读取图标失败: {}: {error}", icon.source_path.display()))?;
        packer
            .pack_own(icon.key.clone(), texture)
            .map_err(|error| eyre!("打包图标失败: {}: {error:?}", icon.source_path.display()))?;
        source_paths.insert(icon.key.clone(), icon.source_path.clone());
    }

    let mut pages = Vec::new();
    let mut sprites = BTreeMap::new();

    for (page_index, page) in packer.get_pages().iter().enumerate() {
        let page_file = format!("atlas-{}-{}.png", group.label, page_index);
        let page_path = output.join(&page_file);

        eprintln!("   写出图页: {} ({}x{})", page_file, page.width(), page.height());

        render_page_image(page, &source_paths)?
            .save(&page_path)
            .wrap_err_with(|| format!("写入 atlas 图页失败: {}", page_path.display()))?;

        pages.push(AtlasPage {
            index: page_index,
            file: page_file,
            width: page.width(),
            height: page.height(),
        });

        for (key, frame) in page.get_frames() {
            sprites.insert(
                key.clone(),
                AtlasSprite {
                    page: page_index,
                    x: frame.frame.x,
                    y: frame.frame.y,
                    width: frame.frame.w,
                    height: frame.frame.h,
                    rotated: frame.rotated,
                    source_width: frame.source.w,
                    source_height: frame.source.h,
                },
            );
        }
    }

    Ok(AtlasGroupManifest {
        sprite_width: group.uniform_size.as_ref().map(|size| size.width),
        sprite_height: group.uniform_size.as_ref().map(|size| size.height),
        pages,
        sprites,
    })
}

fn render_page_image(
    page: &TexturePacker<'_, DynamicImage, String>,
    source_paths: &BTreeMap<String, PathBuf>,
) -> Result<RgbaImage> {
    let mut atlas = RgbaImage::new(page.width(), page.height());

    for (key, frame) in page.get_frames() {
        let source_path = source_paths.get(key).ok_or_else(|| eyre!("找不到图标源文件: {key}"))?;
        let source_image = image::open(source_path)
            .wrap_err_with(|| format!("读取图标失败: {}", source_path.display()))?
            .into_rgba8();

        if frame.rotated {
            return Err(eyre!("当前 atlas 渲染不支持旋转图块: {key}"));
        }

        atlas
            .copy_from(&source_image, frame.frame.x, frame.frame.y)
            .map_err(|error| eyre!("渲染图块失败 {key}: {error}"))?;
    }

    Ok(atlas)
}

fn texture_packer_config(max_size: u32, padding: u32) -> TexturePackerConfig {
    TexturePackerConfig {
        max_width: max_size,
        max_height: max_size,
        allow_rotation: false,
        force_max_dimensions: false,
        border_padding: 0,
        texture_padding: padding,
        texture_extrusion: 0,
        trim: false,
        texture_outlines: false,
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
struct SizeKey {
    width: u32,
    height: u32,
}

impl SizeKey {
    fn from_icon(icon: &CuratedIcon) -> Self {
        Self {
            width: icon.width,
            height: icon.height,
        }
    }

    fn label(&self) -> String {
        format!("{}x{}", self.width, self.height)
    }
}

#[derive(Clone)]
struct CuratedIcon {
    key: String,
    source_path: PathBuf,
    width: u32,
    height: u32,
}

impl CuratedIcon {
    fn area(&self) -> u64 {
        u64::from(self.width) * u64::from(self.height)
    }

    fn longest_edge(&self) -> u32 {
        self.width.max(self.height)
    }
}

struct AtlasGroupInput {
    label: String,
    uniform_size: Option<SizeKey>,
    icons: Vec<CuratedIcon>,
}

#[derive(Serialize)]
struct AtlasManifest {
    version: u32,
    source: String,
    max_page_size: u32,
    padding: u32,
    groups: BTreeMap<String, AtlasGroupManifest>,
}

#[derive(Serialize)]
struct AtlasGroupManifest {
    sprite_width: Option<u32>,
    sprite_height: Option<u32>,
    pages: Vec<AtlasPage>,
    sprites: BTreeMap<String, AtlasSprite>,
}

#[derive(Serialize)]
struct AtlasPage {
    index: usize,
    file: String,
    width: u32,
    height: u32,
}

#[derive(Serialize)]
struct AtlasSprite {
    page: usize,
    x: u32,
    y: u32,
    width: u32,
    height: u32,
    rotated: bool,
    source_width: u32,
    source_height: u32,
}

#[cfg(test)]
mod tests {
    use std::fs;

    use image::{ImageBuffer, Rgba};
    use tempfile::tempdir;

    use super::{run_atlas, sprite_key_from_relative_path};

    #[test]
    fn run_atlas_groups_sprites_by_size() {
        let temp_dir = tempdir().unwrap();
        let icons_dir = temp_dir.path().join("icons");
        let atlas_output_dir = temp_dir.path().join("atlas");

        fs::create_dir_all(icons_dir.join("item")).unwrap();
        fs::create_dir_all(icons_dir.join("technology")).unwrap();

        write_png(icons_dir.join("item/iron-plate.png"), 16, 16, [255, 0, 0, 255]);
        write_png(icons_dir.join("item/copper-plate.png"), 16, 16, [255, 128, 0, 255]);
        write_png(icons_dir.join("technology/automation.png"), 32, 32, [0, 128, 255, 255]);

        run_atlas(&icons_dir, &atlas_output_dir, 128, 2).unwrap();

        assert!(atlas_output_dir.join("atlas-misc-0.png").exists());
        assert!(atlas_output_dir.join("manifest.json").exists());

        let manifest = fs::read_to_string(atlas_output_dir.join("manifest.json")).unwrap();
        assert!(manifest.contains("\"misc\""));
        assert!(manifest.contains("\"item/iron-plate\""));
        assert!(manifest.contains("\"technology/automation\""));
    }

    #[test]
    fn run_atlas_keeps_large_uniform_groups_separate() {
        let temp_dir = tempdir().unwrap();
        let icons_dir = temp_dir.path().join("icons");
        let atlas_output_dir = temp_dir.path().join("atlas");

        fs::create_dir_all(icons_dir.join("item")).unwrap();
        fs::create_dir_all(icons_dir.join("technology")).unwrap();

        for index in 0..10 {
            write_png(
                icons_dir.join(format!("item/item-{index}.png")),
                16,
                16,
                [255, 0, 0, 255],
            );
        }

        write_png(icons_dir.join("technology/automation.png"), 32, 32, [0, 128, 255, 255]);

        run_atlas(&icons_dir, &atlas_output_dir, 128, 2).unwrap();

        assert!(atlas_output_dir.join("atlas-16x16-0.png").exists());
        assert!(atlas_output_dir.join("atlas-misc-0.png").exists());

        let manifest = fs::read_to_string(atlas_output_dir.join("manifest.json")).unwrap();
        assert!(manifest.contains("\"16x16\""));
        assert!(manifest.contains("\"misc\""));
    }

    #[test]
    fn sprite_key_uses_relative_path_without_extension() {
        let key = sprite_key_from_relative_path(std::path::Path::new("item/iron-plate.png")).unwrap();
        assert_eq!(key, "item/iron-plate");
    }

    fn write_png(path: std::path::PathBuf, width: u32, height: u32, color: [u8; 4]) {
        let image = ImageBuffer::<Rgba<u8>, Vec<u8>>::from_fn(width, height, |_x, _y| Rgba(color));
        image.save(path).unwrap();
    }
}

