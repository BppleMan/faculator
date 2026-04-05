#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum ModuleCategory {
    #[serde(rename = "efficiency")]
    Efficiency,
    #[serde(rename = "productivity")]
    Productivity,
    #[serde(rename = "quality")]
    Quality,
    #[serde(rename = "speed")]
    Speed,
}

impl ModuleCategory {
    pub const fn category_name(self) -> &'static str {
        match self {
            Self::Efficiency => "efficiency",
            Self::Productivity => "productivity",
            Self::Quality => "quality",
            Self::Speed => "speed",
        }
    }
}
