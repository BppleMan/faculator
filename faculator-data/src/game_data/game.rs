//! 顶层 `game` 元数据对象。
//!
//! 这部分不是物料、配方或实体本身，而是“本次导出快照”的上下文信息。
//! 其中最特别的字段是 `active_mods`：
//!
//! - 在 `game-data.json` 中它是一个对象：`{ "base": "2.0.76", "space-age": "2.0.76" }`
//! - 在本 DTO 中它被整理成 `Vec<Mod>`
//!
//! 这样做的原因是：
//!
//! - 代码里更容易显式表示“mod 由名称和版本组成”
//! - 后续入库时也更自然拆成 `game` 主表 + `active_mod` 子表
mod mod_info;

pub use mod_info::*;

use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::BTreeMap;

/// 导出快照对应的 `game` 对象。
#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Game {
    /// 导出 mod 自身版本。
    ///
    /// 该值来自 `game.exporter_version`，用于识别导出 schema 版本。
    #[serde(alias = "export_mod_version")]
    pub exporter_version: String,

    /// Factorio 主程序版本。
    ///
    /// 该值来自 `game.factorio_version`，可用于标识不同游戏版本下的数据快照。
    pub factorio_version: String,

    /// 启用 mod 列表。
    ///
    /// 原始 JSON 是 `{ mod_name: mod_version }` 映射，本字段会被收敛成 `Vec<Mod>`。
    /// 这组数据后续很适合单独入库成 `active_mods` 关联表，使用 `(snapshot_id, mod_name)` 作为复合键。
    #[serde(
        deserialize_with = "deserialize_active_mods",
        serialize_with = "serialize_active_mods"
    )]
    pub active_mods: Vec<Mod>,
}

fn deserialize_active_mods<'de, D>(deserializer: D) -> Result<Vec<Mod>, D::Error>
where
    D: Deserializer<'de>,
{
    let mods = BTreeMap::<String, String>::deserialize(deserializer)?;
    Ok(mods.into_iter().map(|(name, version)| Mod { name, version }).collect())
}

fn serialize_active_mods<S>(mods: &[Mod], serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let map = mods
        .iter()
        .map(|game_mod| (game_mod.name.as_str(), game_mod.version.as_str()))
        .collect::<BTreeMap<_, _>>();
    map.serialize(serializer)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn active_mods_serializes_as_object() {
        let game = Game {
            exporter_version: "0.1.0".to_owned(),
            factorio_version: "2.0.76".to_owned(),
            active_mods: vec![
                Mod {
                    name: "base".to_owned(),
                    version: "2.0.76".to_owned(),
                },
                Mod {
                    name: "space-age".to_owned(),
                    version: "2.0.76".to_owned(),
                },
            ],
        };

        let value = serde_json::to_value(game).expect("game should serialize");

        assert_eq!(value["active_mods"]["base"], "2.0.76");
        assert_eq!(value["active_mods"]["space-age"], "2.0.76");
    }
}
