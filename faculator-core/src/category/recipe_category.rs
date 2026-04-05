#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum RecipeCategory {
    #[serde(rename = "advanced-crafting")]
    AdvancedCrafting,
    #[serde(rename = "basic-crafting")]
    BasicCrafting,
    #[serde(rename = "captive-spawner-process")]
    CaptiveSpawnerProcess,
    #[serde(rename = "centrifuging")]
    Centrifuging,
    #[serde(rename = "chemistry")]
    Chemistry,
    #[serde(rename = "chemistry-or-cryogenics")]
    ChemistryOrCryogenics,
    #[serde(rename = "crafting")]
    Crafting,
    #[serde(rename = "crafting-with-fluid")]
    CraftingWithFluid,
    #[serde(rename = "crafting-with-fluid-or-metallurgy")]
    CraftingWithFluidOrMetallurgy,
    #[serde(rename = "crushing")]
    Crushing,
    #[serde(rename = "cryogenics")]
    Cryogenics,
    #[serde(rename = "cryogenics-or-assembling")]
    CryogenicsOrAssembling,
    #[serde(rename = "electromagnetics")]
    Electromagnetics,
    #[serde(rename = "electronics")]
    Electronics,
    #[serde(rename = "electronics-or-assembling")]
    ElectronicsOrAssembling,
    #[serde(rename = "electronics-with-fluid")]
    ElectronicsWithFluid,
    #[serde(rename = "metallurgy")]
    Metallurgy,
    #[serde(rename = "metallurgy-or-assembling")]
    MetallurgyOrAssembling,
    #[serde(rename = "oil-processing")]
    OilProcessing,
    #[serde(rename = "organic")]
    Organic,
    #[serde(rename = "organic-or-assembling")]
    OrganicOrAssembling,
    #[serde(rename = "organic-or-chemistry")]
    OrganicOrChemistry,
    #[serde(rename = "organic-or-hand-crafting")]
    OrganicOrHandCrafting,
    #[serde(rename = "parameters")]
    Parameters,
    #[serde(rename = "pressing")]
    Pressing,
    #[serde(rename = "recycling")]
    Recycling,
    #[serde(rename = "recycling-or-hand-crafting")]
    RecyclingOrHandCrafting,
    #[serde(rename = "rocket-building")]
    RocketBuilding,
    #[serde(rename = "smelting")]
    Smelting,
}

impl RecipeCategory {
    pub const fn category_name(self) -> &'static str {
        match self {
            Self::AdvancedCrafting => "advanced-crafting",
            Self::BasicCrafting => "basic-crafting",
            Self::CaptiveSpawnerProcess => "captive-spawner-process",
            Self::Centrifuging => "centrifuging",
            Self::Chemistry => "chemistry",
            Self::ChemistryOrCryogenics => "chemistry-or-cryogenics",
            Self::Crafting => "crafting",
            Self::CraftingWithFluid => "crafting-with-fluid",
            Self::CraftingWithFluidOrMetallurgy => "crafting-with-fluid-or-metallurgy",
            Self::Crushing => "crushing",
            Self::Cryogenics => "cryogenics",
            Self::CryogenicsOrAssembling => "cryogenics-or-assembling",
            Self::Electromagnetics => "electromagnetics",
            Self::Electronics => "electronics",
            Self::ElectronicsOrAssembling => "electronics-or-assembling",
            Self::ElectronicsWithFluid => "electronics-with-fluid",
            Self::Metallurgy => "metallurgy",
            Self::MetallurgyOrAssembling => "metallurgy-or-assembling",
            Self::OilProcessing => "oil-processing",
            Self::Organic => "organic",
            Self::OrganicOrAssembling => "organic-or-assembling",
            Self::OrganicOrChemistry => "organic-or-chemistry",
            Self::OrganicOrHandCrafting => "organic-or-hand-crafting",
            Self::Parameters => "parameters",
            Self::Pressing => "pressing",
            Self::Recycling => "recycling",
            Self::RecyclingOrHandCrafting => "recycling-or-hand-crafting",
            Self::RocketBuilding => "rocket-building",
            Self::Smelting => "smelting",
        }
    }
}
