use serde::{Deserialize, Serialize};

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
