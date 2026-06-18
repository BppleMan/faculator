mod quality;
mod quality_transform;

use bigdecimal::{BigDecimal as Decimal, One, Zero};

pub type Rate = Decimal;
pub type Matrix5 = [[Rate; 5]; 5];

pub struct Recipe {
    pub input: u64,
    pub output: u64,
}

pub fn generate_k_g(recipe: Recipe, recycle_rate: f64, q: Matrix5) -> u64 {
    0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::quality_transform::{QualityRate, QualityTransform};
    use std::str::FromStr;

    #[test]
    fn it_works() {
        let transform = QualityTransform::from_q(Decimal::from_str("0.246").unwrap());
        println!("{}", transform);
    }
}
