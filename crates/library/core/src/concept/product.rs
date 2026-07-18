use crate::concept::MaterialId;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct Product {
    pub material: MaterialId,
    pub amount: Option<Decimal>,
    pub amount_min: Option<Decimal>,
    pub amount_max: Option<Decimal>,
    pub probability: Option<Decimal>,
    pub temperature: Option<Decimal>,
    pub catalyst_amount: Option<Decimal>,
    pub percent_spoiled: Option<Decimal>,
    pub ignored_by_stats: Option<Decimal>,
    pub ignored_by_productivity: Option<Decimal>,
}
