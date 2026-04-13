use crate::{concept::Number, material::FluidId};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 一个地表条件约束。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct SurfaceCondition {
    pub property: String,
    pub min: Number,
    pub max: Number,
}

/// RGBA 颜色对象。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Color {
    pub r: Decimal,
    pub g: Decimal,
    pub b: Decimal,
    pub a: Decimal,
}

/// 一个流体箱原型定义。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct FluidBoxPrototype {
    pub index: u64,
    pub production_type: String,
    pub filter: Option<FluidId>,
    pub minimum_temperature: Option<Decimal>,
    pub maximum_temperature: Option<Decimal>,
    pub volume: Decimal,
}

/// 一个热缓冲区原型定义。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct HeatBufferPrototype {
    pub max_temperature: Decimal,
    pub default_temperature: Decimal,
    pub specific_heat: Decimal,
    pub max_transfer: Decimal,
    pub min_temperature_gradient: Decimal,
    pub min_working_temperature: Decimal,
    pub minimum_glow_temperature: Decimal,
}
