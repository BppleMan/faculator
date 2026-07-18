//! 顶层受控类别集合。
//!
//! 这些类型本身不是复杂 DTO，但它们会被 `items`、`recipes`、`entities` 中的大量字段引用，
//! 因而是构建字典表和外键约束的重要基础。
mod fuel_category;
mod module_category;
mod recipe_category;
mod resource_category;

pub use fuel_category::*;
pub use module_category::*;
pub use recipe_category::*;
pub use resource_category::*;
