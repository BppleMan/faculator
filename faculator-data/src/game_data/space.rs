//! 顶层 `space_locations` 与 `space_connections` DTO。
//!
//! 这一部分是太空 / 行星系统的拓扑数据：
//!
//! - `SpaceLocation.name` 是地点主键
//! - `SpaceConnection.from` / `to` 引用地点
//!
//! 因此它们天然适合建成“地点表 + 航线表”的关系模型。
mod space_connection;
mod space_location;
mod space_position;
mod surface_properties;

pub use space_connection::*;
pub use space_location::*;
pub use space_position::*;
pub use surface_properties::*;
