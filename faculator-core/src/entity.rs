use faculator_macros::ID;
use serde::{Deserialize, Serialize};

/// 地图实体原型的稳定身份。
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[derive(ID, Serialize, Deserialize)]
#[serde(transparent)]
pub struct EntityId(String);
