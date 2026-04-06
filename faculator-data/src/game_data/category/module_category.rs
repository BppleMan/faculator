/// 顶层 `module_categories` 的受控取值。
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum ModuleCategory {
    /// 效率模块类别。
    ///
    /// 这类模块通常降低能耗或资源消耗。
    #[serde(rename = "efficiency")]
    Efficiency,

    /// 生产力模块类别。
    ///
    /// 这类模块通常提高单位输入产出效率。
    #[serde(rename = "productivity")]
    Productivity,

    /// 品质模块类别。
    ///
    /// 这类模块影响产物生成更高品质的概率。
    #[serde(rename = "quality")]
    Quality,

    /// 速度模块类别。
    ///
    /// 这类模块提高机器运行速度。
    #[serde(rename = "speed")]
    Speed,
}

impl ModuleCategory {
    /// 返回导出 JSON 中使用的类别原始名称。
    pub const fn category_name(self) -> &'static str {
        match self {
            Self::Efficiency => "efficiency",
            Self::Productivity => "productivity",
            Self::Quality => "quality",
            Self::Speed => "speed",
        }
    }
}
