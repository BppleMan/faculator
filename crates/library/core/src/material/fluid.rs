use crate::concept::{Color, Number};
use faculator_macros::ID;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct FluidId(String);

/// 流体聚合根。
///
/// `Fluid` 与 `Item` 同属 `material` 侧顶层对象。这里保留会参与计算的物性与可燃性，
/// 展示树相关的 `group/subgroup` 则留给更高层目录模型处理。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Fluid {
    /// 流体名称 / 身份。
    pub name: FluidId,

    /// 展示排序键。
    pub order: String,

    /// 是否隐藏。
    pub hidden: bool,

    /// 热力学属性。
    pub thermodynamics: FluidThermodynamics,

    /// 可燃能力。
    pub fuel: Option<FluidFuelCapability>,

    /// 基础色与流动色。
    pub color: FluidColorSet,
}

impl Fluid {
    pub fn is_fuel(&self) -> bool {
        self.fuel.is_some()
    }
}

/// 流体热力学属性。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct FluidThermodynamics {
    pub default_temperature: Decimal,
    pub max_temperature: Decimal,
    pub heat_capacity: Decimal,

    /// 气化温度。
    ///
    /// 当导出中出现“近似无上限”的极值哨兵时，这里使用 `Number::Sentinel`。
    pub gas_temperature: Number,
}

/// 流体可燃能力。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct FluidFuelCapability {
    pub fuel_value: u64,
    pub emissions_multiplier: Decimal,
}

/// 流体颜色集合。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct FluidColorSet {
    pub base: Color,
    pub flow: Color,
}
