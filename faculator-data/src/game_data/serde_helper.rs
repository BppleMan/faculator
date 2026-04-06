use serde::{Deserialize, Deserializer, Serialize, Serializer};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct NamedEntry<T> {
    name: T,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct EmptyObject {}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
enum VecOrEmptyObject<T> {
    Vec(Vec<T>),
    Empty(EmptyObject),
}

pub(crate) fn deserialize_named_enum_vec<'de, D, T>(deserializer: D) -> Result<Vec<T>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de>,
{
    let entries = Vec::<NamedEntry<T>>::deserialize(deserializer)?;
    Ok(entries.into_iter().map(|entry| entry.name).collect())
}

pub(crate) fn serialize_named_enum_vec<S, T>(values: &[T], serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
    T: Serialize,
{
    let entries = values.iter().map(|value| NamedEntry { name: value }).collect::<Vec<_>>();
    entries.serialize(serializer)
}

pub(crate) fn deserialize_vec_or_empty_object<'de, D, T>(deserializer: D) -> Result<Vec<T>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de>,
{
    Ok(match VecOrEmptyObject::<T>::deserialize(deserializer)? {
        VecOrEmptyObject::Vec(values) => values,
        VecOrEmptyObject::Empty(_) => Vec::new(),
    })
}
