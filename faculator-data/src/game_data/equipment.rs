//! 顶层 `equipment` 与 `equipment_grids` DTO。
//!
//! 这一组对象服务于装甲装备系统：
//!
//! - `Equipment` 表示可安装到网格中的装备原型
//! - `EquipmentGrid` 表示可容纳这些装备的格子布局
//!
//! 其中 `Equipment.take_result` 很关键，它会回指 `items.name`，是装备原型与物品原型之间的桥。
mod equipment_category;
mod equipment_grid;
mod equipment_shape;
mod equipment_type;
mod prototype;

pub use equipment_category::*;
pub use equipment_grid::*;
pub use equipment_shape::*;
pub use equipment_type::*;
pub use prototype::*;
