use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// `space_locations[].position` 坐标对象。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpacePosition {
    /// X 坐标。
    pub x: Decimal,

    /// Y 坐标。
    pub y: Decimal,
}
