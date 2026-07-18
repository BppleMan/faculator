use faculator_macros::ID;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct SpaceLocationId(String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct SpaceConnectionId(String);

/// 一个太空地点或星球原型。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct SpaceLocation {
    pub name: SpaceLocationId,
    pub order: String,
    pub hidden: bool,
    pub solar_power_in_space: u64,
    pub position: SpacePosition,
    pub surface_properties: Option<SurfaceProperty>,
}

/// 一条空间航线。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct SpaceConnection {
    pub name: SpaceConnectionId,
    pub from: SpaceLocationId,
    pub to: SpaceLocationId,
    pub length: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct SpacePosition {
    pub x: Decimal,
    pub y: Decimal,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct SurfaceProperty {
    pub day_night_cycle: Option<u64>,
    pub magnetic_field: Option<u64>,
    pub solar_power: Option<u64>,
    pub pressure: Option<u64>,
    pub gravity: Option<u64>,
}
