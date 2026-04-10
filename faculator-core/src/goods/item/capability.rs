mod fuel_capability;
mod module_capability;
mod placement_capability;
mod transformation_capability;

pub use fuel_capability::*;
pub use module_capability::*;
pub use placement_capability::*;
pub use transformation_capability::*;

use serde::{Deserialize, Serialize};

/// 物品能力对象。
#[derive(Default, Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ItemCapability {
    /// 燃料能力。
    pub fuel: Option<FuelCapability>,

    /// 模块能力。
    pub module: Option<ModuleCapability>,

    /// 放置能力。
    pub placement: Option<PlacementCapability>,

    /// 转化能力。
    pub transformation: Option<TransformationCapability>,
}
