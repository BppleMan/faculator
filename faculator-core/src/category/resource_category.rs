#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum ResourceCategory {
    #[serde(rename = "basic-fluid")]
    BasicFluid,
    #[serde(rename = "basic-solid")]
    BasicSolid,
    #[serde(rename = "hard-solid")]
    HardSolid,
}

impl ResourceCategory {
    pub const fn category_name(self) -> &'static str {
        match self {
            Self::BasicFluid => "basic-fluid",
            Self::BasicSolid => "basic-solid",
            Self::HardSolid => "hard-solid",
        }
    }
}
