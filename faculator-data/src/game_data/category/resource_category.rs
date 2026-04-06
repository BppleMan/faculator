/// 顶层 `resource_categories` 的受控取值。
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum ResourceCategory {
    /// 基础流体资源类别。
    ///
    /// 典型用于原油、水等可直接抽取的流体资源。
    #[serde(rename = "basic-fluid")]
    BasicFluid,

    /// 基础固体资源类别。
    ///
    /// 典型用于铁矿、铜矿、煤等常规固体矿物。
    #[serde(rename = "basic-solid")]
    BasicSolid,

    /// 高硬度固体资源类别。
    ///
    /// 这类资源通常需要更高阶采矿能力。
    #[serde(rename = "hard-solid")]
    HardSolid,
}

impl ResourceCategory {
    /// 返回导出 JSON 中使用的类别原始名称。
    pub const fn category_name(self) -> &'static str {
        match self {
            Self::BasicFluid => "basic-fluid",
            Self::BasicSolid => "basic-solid",
            Self::HardSolid => "hard-solid",
        }
    }
}
