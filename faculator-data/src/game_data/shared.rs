use rust_decimal::Decimal;
use serde::{Deserialize, Deserializer, Serialize, Serializer, de};
use serde_json::Value;
use std::{fmt, str::FromStr};

#[derive(Default, Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EmptyObject {}

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum ArrayOrEmptyObject<T> {
    Array(Vec<T>),
    EmptyObject(EmptyObject),
}

impl<T> Default for ArrayOrEmptyObject<T> {
    fn default() -> Self {
        Self::Array(Vec::new())
    }
}

impl<T> ArrayOrEmptyObject<T> {
    pub fn as_slice(&self) -> &[T] {
        match self {
            Self::Array(values) => values.as_slice(),
            Self::EmptyObject(_) => &[],
        }
    }

    pub fn len(&self) -> usize {
        self.as_slice().len()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn into_vec(self) -> Vec<T> {
        match self {
            Self::Array(values) => values,
            Self::EmptyObject(_) => Vec::new(),
        }
    }
}

/// 导出 JSON 中的原始数字文本。
///
/// 这个类型专门用于承接 `FLT_MAX` / `DBL_MAX` 一类超出 `Decimal` 能力范围的哨兵值，
/// 避免把 `serde_json::Number` 直接暴露到 DTO 结构体字段上。
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExportedNumber(String);

/// 导出里出现过的极值哨兵。
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NumericSentinel {
    F32Max,
    F64Max,
}

impl NumericSentinel {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::F32Max => ExportedNumber::F32_MAX_TEXT,
            Self::F64Max => ExportedNumber::F64_MAX_TEXT,
        }
    }
}

impl ExportedNumber {
    pub const F32_MAX_TEXT: &str = "340282346638528942488602606004204804240";
    pub const F64_MAX_TEXT: &str = "1.79769313486231556709071810473687946796417236328125e+308";

    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub fn into_string(self) -> String {
        self.0
    }

    pub fn as_decimal(&self) -> Option<Decimal> {
        Decimal::from_str(self.as_str()).ok()
    }

    pub fn sentinel_kind(&self) -> Option<NumericSentinel> {
        match self.0.as_str() {
            Self::F32_MAX_TEXT => return Some(NumericSentinel::F32Max),
            Self::F64_MAX_TEXT => return Some(NumericSentinel::F64Max),
            _ => {}
        }

        if self.0.parse::<f32>().ok().is_some_and(|value| value == f32::MAX) {
            return Some(NumericSentinel::F32Max);
        }
        if self.0.parse::<f64>().ok().is_some_and(|value| value == f64::MAX) {
            return Some(NumericSentinel::F64Max);
        }

        None
    }

    pub fn is_sentinel(&self) -> bool {
        self.sentinel_kind().is_some()
    }
}

impl From<String> for ExportedNumber {
    fn from(value: String) -> Self {
        Self(value)
    }
}

impl From<&str> for ExportedNumber {
    fn from(value: &str) -> Self {
        Self(value.to_owned())
    }
}

impl fmt::Display for ExportedNumber {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl Serialize for ExportedNumber {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match serde_json::from_str::<Value>(self.as_str()) {
            Ok(Value::Number(number)) => number.serialize(serializer),
            _ => serializer.serialize_str(self.as_str()),
        }
    }
}

impl<'de> Deserialize<'de> for ExportedNumber {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        match Value::deserialize(deserializer)? {
            Value::Number(number) => Ok(Self(number.to_string())),
            Value::String(text) => Ok(Self(text)),
            Value::Null => Err(de::Error::custom("expected json number or string, found null")),
            Value::Bool(_) => Err(de::Error::custom("expected json number or string, found bool")),
            Value::Array(_) => Err(de::Error::custom("expected json number or string, found array")),
            Value::Object(_) => Err(de::Error::custom("expected json number or string, found object")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exported_number_accepts_regular_decimal() {
        let value = serde_json::from_str::<ExportedNumber>("15.5").expect("number should deserialize");

        assert_eq!(value.as_str(), "15.5");
        assert_eq!(
            value.as_decimal(),
            Some(Decimal::from_str("15.5").expect("decimal literal should parse"))
        );
        assert!(!value.is_sentinel());
    }

    #[test]
    fn exported_number_detects_known_sentinels() {
        let f32_max = serde_json::from_str::<ExportedNumber>(ExportedNumber::F32_MAX_TEXT)
            .expect("f32 sentinel should deserialize");
        let f64_max = serde_json::from_str::<ExportedNumber>(ExportedNumber::F64_MAX_TEXT)
            .expect("f64 sentinel should deserialize");

        assert_eq!(f32_max.sentinel_kind(), Some(NumericSentinel::F32Max));
        assert_eq!(f64_max.sentinel_kind(), Some(NumericSentinel::F64Max));
        assert_eq!(NumericSentinel::F32Max.as_str(), ExportedNumber::F32_MAX_TEXT);
        assert_eq!(NumericSentinel::F64Max.as_str(), ExportedNumber::F64_MAX_TEXT);
    }
}
