#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum FuelCategory {
    #[serde(rename = "chemical")]
    Chemical,
    #[serde(rename = "food")]
    Food,
    #[serde(rename = "fusion")]
    Fusion,
    #[serde(rename = "nuclear")]
    Nuclear,
    #[serde(rename = "nutrients")]
    Nutrients,
}

impl FuelCategory {
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
