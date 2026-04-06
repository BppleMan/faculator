/// 顶层 `fuel_categories` 的受控取值。
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum FuelCategory {
    /// 化学燃料。
    ///
    /// 典型例子是煤炭、固体燃料等常规可燃物。
    #[serde(rename = "chemical")]
    Chemical,

    /// 食物类燃料。
    ///
    /// 该类别通常由生物 / 有机相关内容使用。
    #[serde(rename = "food")]
    Food,

    /// 聚变燃料。
    ///
    /// 用于更高阶的聚变能源体系。
    #[serde(rename = "fusion")]
    Fusion,

    /// 核燃料。
    ///
    /// 典型例子是核燃料棒等高能燃料。
    #[serde(rename = "nuclear")]
    Nuclear,

    /// 营养类燃料。
    ///
    /// 该类别常用于生物生产链中的营养供给。
    #[serde(rename = "nutrients")]
    Nutrients,
}

impl FuelCategory {
    /// 返回导出 JSON 中使用的类别原始名称。
    pub const fn category_name(self) -> &'static str {
        match self {
            Self::Chemical => "chemical",
            Self::Food => "food",
            Self::Fusion => "fusion",
            Self::Nuclear => "nuclear",
            Self::Nutrients => "nutrients",
        }
    }
}
