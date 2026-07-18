//! 可复用的嵌套值对象与子结构集合。
//!
//! 这些类型不会单独作为顶层集合出现在 `game-data.json`，但会嵌入到多个主 DTO 中，
//! 因而决定了后续 SQL 子表、组合对象和 read model 的拆分方式。
mod effect;
mod energy;
mod environment;
mod material;
mod placement;

pub use effect::*;
pub use energy::*;
pub use environment::*;
pub use material::*;
pub use placement::*;
