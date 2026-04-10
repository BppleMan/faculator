//! `game-data.json` 的 source DTO 入口。
//!
//! 这一层的目标不是表达真正的领域模型，而是以“尽可能忠实、尽可能可读”的方式承接导出文件：
//!
//! 1. 字段命名尽量贴近 `game-data.json` 原始键名，方便从代码直接反推 JSON 结构。
//! 2. 仅在导出格式存在明显技巧或陷阱时做轻量适配，例如：
//!    - `game.active_mods` 保留为 JSON 原始对象形状；
//!    - 四类 `*_categories` 保留为 `[{ "name": "..." }]` 结构，而不是提前压成 enum；
//!    - 某些“空列表”在 JSON 中会导出成 `{}`，这一层会用显式 DTO 类型保留这种双形态；
//!    - 少数字段会用 `FLT_MAX` / `DBL_MAX` 等极大值充当哨兵，相关字段因此不能简单使用 `Decimal`。
//! 3. 本模块中的注释会特别指出哪些字段天然适合作为 SQL 主键、外键或关联表来源。
//!
//! 顶层模块组织规则：
//!
//! - 本文件是 `game_data` 模块入口，也是整个 `game-data.json` 根对象 `GameData` 的定义位置。
//! - 本文件通过 `pub mod` 暴露一级子模块，使目录结构与代码引用层级保持一致。
//! - 若一级子模块内部还有孙子模块，则该子模块自身负责用 `mod + pub use *` 整理其内部暴露面。
use self::{
    category::{FuelCategory, ModuleCategory, RecipeCategory, ResourceCategory},
    entity::Entity,
    equipment::{Equipment, EquipmentGrid},
    fluid::Fluid,
    game::Game,
    item::Item,
    item_group::ItemGroup,
    quality::Quality,
    recipe::Recipe,
    space::{SpaceConnection, SpaceLocation},
    technology::Technology,
};
use color_eyre::Result;
use serde::{Deserialize, Serialize};

pub mod category;
pub mod concept;
pub mod entity;
pub mod equipment;
pub mod fluid;
pub mod game;
pub mod item;
pub mod item_group;
pub mod quality;
pub mod recipe;
pub mod space;
pub mod technology;

mod serde_helper;

pub use serde_helper::{ArrayOrEmptyObject, EmptyObject};

/// `game-data.json` 的根对象。
///
/// 该结构与导出 JSON 的顶层键一一对应：
///
/// - `game`
/// - `recipe_categories`
/// - `fuel_categories`
/// - `resource_categories`
/// - `module_categories`
/// - `items`
/// - `fluids`
/// - `recipes`
/// - `entities`
/// - `item_groups`
/// - `technologies`
/// - `qualities`
/// - `space_locations`
/// - `space_connections`
/// - `equipment`
/// - `equipment_grids`
///
/// 因为这是 source DTO 入口，所以看到这里就应该能知道整个导出文件的骨架长什么样。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct GameData {
    /// 顶层 `game` 元数据对象。
    ///
    /// 这里记录导出器版本、Factorio 版本以及启用的 mod 列表。
    /// 在 SQL 中通常会落成一张单独的 `game` / `snapshot` 元数据表。
    pub game: Game,

    /// 顶层 `recipe_categories` 集合。
    ///
    /// 原始 JSON 形状是 `[{ "name": "crafting" }, ...]`，这里按原始对象数组保留。
    /// 这组值通常可以建成 recipe 维表，并作为 `recipes.category` /
    /// `recipes.additional_categories` 的外键候选来源。
    #[serde(default)]
    pub recipe_categories: Vec<RecipeCategory>,

    /// 顶层 `fuel_categories` 集合。
    ///
    /// 原始 JSON 同样是 `{ name }` 对象数组，这里按原始对象数组保留。
    /// 这组值是 `items.fuel_category`、`fluids.fuel_category` 以及
    /// `entities.energy_sources.burner.fuel_categories[]` 的天然外键来源。
    #[serde(default)]
    pub fuel_categories: Vec<FuelCategory>,

    /// 顶层 `resource_categories` 集合。
    ///
    /// 这组值主要会被 `entities.resource_categories[]` 引用，适合拆成资源类别表或字典表。
    #[serde(default)]
    pub resource_categories: Vec<ResourceCategory>,

    /// 顶层 `module_categories` 集合。
    ///
    /// 这组值会被模块物品的 `items.category` 以及机器的
    /// `entities.allowed_module_categories[]` 引用，是模块体系的重要维度表来源。
    #[serde(default)]
    pub module_categories: Vec<ModuleCategory>,

    /// 顶层 `items` 集合。
    ///
    /// `Item.name` 是最重要的自然主键之一，会被配方、科技、实体放置关系等多处引用。
    #[serde(default)]
    pub items: Vec<Item>,

    /// 顶层 `fluids` 集合。
    ///
    /// `Fluid.name` 与 `Item.name` 一样，都是物料侧自然主键，会被配方输入输出引用。
    #[serde(default)]
    pub fluids: Vec<Fluid>,

    /// 顶层 `recipes` 集合。
    ///
    /// `Recipe.name` 是配方主键，科技解锁、实体可制作类别、求解器过程图都会依赖它。
    #[serde(default)]
    pub recipes: Vec<Recipe>,

    /// 顶层 `entities` 集合。
    ///
    /// `Entity.name` 是地图实体主键，`items.place_result`、`entities.next_upgrade`、
    /// `entities.items_to_place_this[]` 等都会围绕它建立关联。
    #[serde(default)]
    pub entities: Vec<Entity>,

    /// 顶层 `item_groups` 集合。
    ///
    /// 这是展示 / 百科导航树的起点，后续 `group` / `subgroup` 字段可以从这里构建目录外键。
    #[serde(default)]
    pub item_groups: Vec<ItemGroup>,

    /// 顶层 `technologies` 集合。
    ///
    /// 科技树本身就是一张关系图：`prerequisites`、`successors`、`effects` 都适合拆成关联表。
    #[serde(default)]
    pub technologies: Vec<Technology>,

    /// 顶层 `qualities` 集合。
    ///
    /// 品质等级在导出中是受控链表结构，`next` 字段天然形成自引用外键。
    #[serde(default)]
    pub qualities: Vec<Quality>,

    /// 顶层 `space_locations` 集合。
    ///
    /// 这些对象为太空相关系统提供地点主键，`SpaceConnection.from/to` 会引用这里的 `name`。
    #[serde(default)]
    pub space_locations: Vec<SpaceLocation>,

    /// 顶层 `space_connections` 集合。
    ///
    /// 这是星际航线表，`from` / `to` 是面向 `space_locations.name` 的外键候选。
    #[serde(default)]
    pub space_connections: Vec<SpaceConnection>,

    /// 顶层 `equipment` 集合。
    ///
    /// 这些对象描述装甲装备原型，`take_result` 会回指 `items.name`，是重要的物品反向映射线索。
    #[serde(default)]
    pub equipment: Vec<Equipment>,

    /// 顶层 `equipment_grids` 集合。
    ///
    /// 这部分定义装甲网格形状与可接受装备类别，通常适合单独入库成装备网格表。
    #[serde(default)]
    pub equipment_grids: Vec<EquipmentGrid>,
}

impl GameData {
    pub fn info(&self) -> Result<String> {
        use std::fmt::Write;
        let mut buffer = String::new();

        const KEY_WIDTH: usize = 22;

        fn write_kv(buffer: &mut String, key: &str, value: impl std::fmt::Display) -> std::fmt::Result {
            use std::fmt::Write;
            writeln!(buffer, "| {:<KEY_WIDTH$} | {}", key, value)
        }

        let active_mod_count = self.game.active_mods.len();
        let base_mod_version = self.game.active_mods.get("base").map(String::as_str).unwrap_or("unknown");

        let total_main_entries = self.items.len()
            + self.fluids.len()
            + self.recipes.len()
            + self.entities.len()
            + self.technologies.len()
            + self.qualities.len()
            + self.space_locations.len()
            + self.space_connections.len()
            + self.equipment.len()
            + self.equipment_grids.len();

        writeln!(buffer, "=== game-data summary ===")?;
        writeln!(buffer, "+-{:-<KEY_WIDTH$}-+----------------", "")?;
        write_kv(&mut buffer, "Factorio", &self.game.factorio_version)?;
        write_kv(&mut buffer, "Base mod", base_mod_version)?;
        write_kv(&mut buffer, "Exporter", &self.game.exporter_version)?;
        write_kv(&mut buffer, "Active mods", active_mod_count)?;
        writeln!(buffer, "+-{:-<KEY_WIDTH$}-+----------------", "")?;
        writeln!(buffer)?;

        writeln!(buffer, "[Categories]")?;
        writeln!(buffer, "+-{:-<KEY_WIDTH$}-+----------------", "")?;
        write_kv(&mut buffer, "recipe_categories", self.recipe_categories.len())?;
        write_kv(&mut buffer, "fuel_categories", self.fuel_categories.len())?;
        write_kv(&mut buffer, "resource_categories", self.resource_categories.len())?;
        write_kv(&mut buffer, "module_categories", self.module_categories.len())?;
        writeln!(buffer, "+-{:-<KEY_WIDTH$}-+----------------", "")?;
        writeln!(buffer)?;

        writeln!(buffer, "[Main Data]")?;
        writeln!(buffer, "+-{:-<KEY_WIDTH$}-+----------------", "")?;
        write_kv(&mut buffer, "item_groups", self.item_groups.len())?;
        write_kv(&mut buffer, "items", self.items.len())?;
        write_kv(&mut buffer, "fluids", self.fluids.len())?;
        write_kv(&mut buffer, "recipes", self.recipes.len())?;
        write_kv(&mut buffer, "entities", self.entities.len())?;
        write_kv(&mut buffer, "technologies", self.technologies.len())?;
        write_kv(&mut buffer, "qualities", self.qualities.len())?;
        write_kv(&mut buffer, "space_locations", self.space_locations.len())?;
        write_kv(&mut buffer, "space_connections", self.space_connections.len())?;
        write_kv(&mut buffer, "equipment", self.equipment.len())?;
        write_kv(&mut buffer, "equipment_grids", self.equipment_grids.len())?;
        writeln!(buffer, "+-{:-<KEY_WIDTH$}-+----------------", "")?;
        write_kv(&mut buffer, "TOTAL(main)", total_main_entries)?;
        writeln!(buffer, "+-{:-<KEY_WIDTH$}-+----------------", "")?;

        Ok(buffer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exported_sample_can_be_deserialized() {
        let game_data = serde_json::from_str::<GameData>(include_str!("../../assets/exported/game-data.json"))
            .expect("exported game-data.json should deserialize into source DTO");

        assert_eq!(game_data.game.factorio_version, "2.0.76");
        assert!(
            game_data
                .game
                .active_mods
                .get("base")
                .is_some_and(|version| version == "2.0.76")
        );
        assert_eq!(
            game_data.recipe_categories.first().map(|category| category.name.as_str()),
            Some("advanced-crafting")
        );
        assert_eq!(
            game_data.item_groups.first().map(|group| group.name.as_str()),
            Some("logistics")
        );
        assert_eq!(
            game_data.technologies.first().map(|technology| technology.name.as_str()),
            Some("advanced-asteroid-processing")
        );
        assert!(!game_data.items.is_empty());
        assert!(!game_data.recipes.is_empty());
        assert!(!game_data.entities.is_empty());
    }
}
