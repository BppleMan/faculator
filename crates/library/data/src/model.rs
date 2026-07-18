//! 数据库 model 入口。
//!
//! 这一层是 `game_data` 与 SQLite 之间的中间规范化结构：
//!
//! - 顶层集合各自有主表
//! - 多值字段、数组字段、逻辑多对多关系会拆成关联表 / 子表
//! - 数据库里仍以字符串列保存枚举语义，不依赖数据库原生 enum
//!
//! 换句话说，`game_data` 负责“把输入说明清楚”，`model` 负责“把关系落成表”。
pub use crate::db::entity;
pub use crate::db::service;
