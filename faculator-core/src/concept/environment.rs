use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SurfaceCondition {
    pub property: String,
    pub min: Decimal,
    pub max: Decimal,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Color {
    pub r: Decimal,
    pub g: Decimal,
    pub b: Decimal,
    pub a: Decimal,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FluidBoxPrototype {
    pub production_type: String,
    pub filter: Option<String>,
    pub minimum_temperature: Option<Decimal>,
    pub maximum_temperature: Option<Decimal>,
    pub base_area: Decimal,
    pub base_level: Decimal,
    pub volume: Option<Decimal>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HeatBufferPrototype {
    pub max_temperature: Decimal,
    pub default_temperature: Decimal,
    pub specific_heat: Decimal,
    pub max_transfer: Decimal,
    pub min_temperature_gradient: Decimal,
    pub min_working_temperature: Decimal,
    pub minimum_glow_temperature: Decimal,
}
