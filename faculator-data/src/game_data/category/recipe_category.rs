/// 顶层 `recipe_categories` 的受控取值。
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum RecipeCategory {
    /// 高级手工制造类别。
    #[serde(rename = "advanced-crafting")]
    AdvancedCrafting,

    /// 基础手工制造类别。
    #[serde(rename = "basic-crafting")]
    BasicCrafting,

    /// 孢子塔 / 虫卵相关处理类别。
    #[serde(rename = "captive-spawner-process")]
    CaptiveSpawnerProcess,

    /// 离心处理类别。
    #[serde(rename = "centrifuging")]
    Centrifuging,

    /// 化工类别。
    #[serde(rename = "chemistry")]
    Chemistry,

    /// 化工或低温工艺类别。
    #[serde(rename = "chemistry-or-cryogenics")]
    ChemistryOrCryogenics,

    /// 通用制造类别。
    #[serde(rename = "crafting")]
    Crafting,

    /// 带流体的通用制造类别。
    #[serde(rename = "crafting-with-fluid")]
    CraftingWithFluid,

    /// 带流体制造或冶金类别。
    #[serde(rename = "crafting-with-fluid-or-metallurgy")]
    CraftingWithFluidOrMetallurgy,

    /// 破碎类别。
    #[serde(rename = "crushing")]
    Crushing,

    /// 低温工艺类别。
    #[serde(rename = "cryogenics")]
    Cryogenics,

    /// 低温工艺或组装类别。
    #[serde(rename = "cryogenics-or-assembling")]
    CryogenicsOrAssembling,

    /// 电磁工艺类别。
    #[serde(rename = "electromagnetics")]
    Electromagnetics,

    /// 电子工艺类别。
    #[serde(rename = "electronics")]
    Electronics,

    /// 电子工艺或组装类别。
    #[serde(rename = "electronics-or-assembling")]
    ElectronicsOrAssembling,

    /// 带流体的电子工艺类别。
    #[serde(rename = "electronics-with-fluid")]
    ElectronicsWithFluid,

    /// 冶金类别。
    #[serde(rename = "metallurgy")]
    Metallurgy,

    /// 冶金或组装类别。
    #[serde(rename = "metallurgy-or-assembling")]
    MetallurgyOrAssembling,

    /// 石油处理类别。
    #[serde(rename = "oil-processing")]
    OilProcessing,

    /// 有机处理类别。
    #[serde(rename = "organic")]
    Organic,

    /// 有机处理或组装类别。
    #[serde(rename = "organic-or-assembling")]
    OrganicOrAssembling,

    /// 有机处理或化工类别。
    #[serde(rename = "organic-or-chemistry")]
    OrganicOrChemistry,

    /// 有机处理或手搓类别。
    #[serde(rename = "organic-or-hand-crafting")]
    OrganicOrHandCrafting,

    /// 参数类占位配方类别。
    #[serde(rename = "parameters")]
    Parameters,

    /// 压制类别。
    #[serde(rename = "pressing")]
    Pressing,

    /// 回收类别。
    #[serde(rename = "recycling")]
    Recycling,

    /// 回收或手搓类别。
    #[serde(rename = "recycling-or-hand-crafting")]
    RecyclingOrHandCrafting,

    /// 火箭构建类别。
    #[serde(rename = "rocket-building")]
    RocketBuilding,

    /// 熔炼类别。
    #[serde(rename = "smelting")]
    Smelting,
}

impl RecipeCategory {
    /// 返回导出 JSON 中使用的类别原始名称。
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
