use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::fmt;

/// 可承载普通十进制数值或导出哨兵语义的领域数值。
#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub enum Number {
    Decimal(Decimal),
    Sentinel,
}

impl Number {
    pub const SENTINEL: Self = Self::Sentinel;

    pub fn as_decimal(&self) -> Option<&Decimal> {
        match self {
            Self::Decimal(value) => Some(value),
            Self::Sentinel => None,
        }
    }

    pub fn into_decimal(self) -> Option<Decimal> {
        match self {
            Self::Decimal(value) => Some(value),
            Self::Sentinel => None,
        }
    }

    pub fn is_decimal(&self) -> bool {
        matches!(self, Self::Decimal(_))
    }

    pub fn is_sentinel(&self) -> bool {
        matches!(self, Self::Sentinel)
    }
}

impl From<Decimal> for Number {
    fn from(value: Decimal) -> Self {
        Self::Decimal(value)
    }
}

impl fmt::Display for Number {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Decimal(value) => write!(f, "{value}"),
            Self::Sentinel => f.write_str("sentinel"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn number_wraps_decimal() {
        let number = Number::from(Decimal::ONE);

        assert!(number.is_decimal());
        assert!(!number.is_sentinel());
        assert_eq!(number.as_decimal(), Some(&Decimal::ONE));
    }

    #[test]
    fn number_handles_sentinel() {
        let number = Number::Sentinel;

        assert!(number.is_sentinel());
        assert!(!number.is_decimal());
        assert_eq!(number.as_decimal(), None);
        assert_eq!(number.to_string(), "sentinel");
    }
}
