//! 顶层 `game` 元数据对象。
//!
//! 这部分不是物料、配方或实体本身，而是“本次导出快照”的上下文信息。
//! `active_mods` 在 `game-data.json` 中本来就是一个对象：
//! `{ "base": "2.0.76", "space-age": "2.0.76" }`。
//! source DTO 直接保留这一形状，把结构化转换留给后续 data -> core 阶段。
mod mod_info;

pub use mod_info::*;

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// 导出快照对应的 `game` 对象。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
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
    /// source DTO 直接保留导出中的对象形状，避免在反序列化层提前做结构重排。
    pub active_mods: BTreeMap<String, String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn active_mods_serializes_as_object() {
        let game = Game {
            exporter_version: "0.1.0".to_owned(),
            factorio_version: "2.0.76".to_owned(),
            active_mods: BTreeMap::from([
                ("base".to_owned(), "2.0.76".to_owned()),
                ("space-age".to_owned(), "2.0.76".to_owned()),
            ]),
        };

        let value = serde_json::to_value(game).expect("game should serialize");

        assert_eq!(value["active_mods"]["base"], "2.0.76");
        assert_eq!(value["active_mods"]["space-age"], "2.0.76");
    }
}
