use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

/// 一个启用 mod 的名称与版本。
#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Mod {
    /// mod 名称。
    ///
    /// 这是 mod 维度上的自然键，可作为 `active_mods` 子表主键的一部分。
    pub name: String,

    /// mod 版本字符串。
    ///
    /// 该值直接来自导出对象，不在 source DTO 阶段解释语义。
    pub version: String,
}

impl Display for Mod {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.name, self.version)
    }
}
