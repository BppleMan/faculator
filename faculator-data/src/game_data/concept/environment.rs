//! 环境与空间条件相关 DTO。
//!
//! 这些对象出现在多个系统里：
//!
//! - `SurfaceCondition` 会出现在配方和实体限制中
//! - `Color` 会出现在流体和品质对象中
//! - `FluidBoxPrototype` / `HeatBufferPrototype` 会出现在能源和流体接口定义中
//!
//! 其中 `SurfaceCondition.min/max` 特别值得注意：导出器会使用极大值作为“近似无界”的哨兵，
//! 因此这里必须用 `serde_json::Number` 承接，而不能简单使用 `Decimal`。
mod fluid_box_production_type;
mod surface_property;

pub use fluid_box_production_type::*;
pub use surface_property::*;

use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde_json::Number;

/// 一个地表条件约束。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SurfaceCondition {
    /// 条件属性名称。
    ///
    /// 该值与 `space_locations.surface_properties` 使用的是同一套地表属性语义。
    pub property: SurfaceProperty,

    /// 条件下界。
    ///
    /// 使用 `Number` 是为了容纳导出中的超大哨兵值。
    pub min: Number,

    /// 条件上界。
    ///
    /// 使用 `Number` 是为了容纳导出中的超大哨兵值。
    pub max: Number,
}

/// RGBA 颜色对象。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Color {
    /// 红色通道。
    pub r: Decimal,

    /// 绿色通道。
    pub g: Decimal,

    /// 蓝色通道。
    pub b: Decimal,

    /// Alpha 通道。
    pub a: Decimal,
}

/// 一个流体箱原型定义。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FluidBoxPrototype {
    /// 流体箱生产类型。
    ///
    /// 这不是任意文本，而是流体接口方向模式。
    pub production_type: FluidBoxProductionType,

    /// 流体过滤器名称。
    ///
    /// 当存在时，通常会引用 `fluids.name`。
    pub filter: Option<String>,

    /// 最低允许温度。
    pub minimum_temperature: Option<Decimal>,

    /// 最高允许温度。
    pub maximum_temperature: Option<Decimal>,

    /// 基础面积。
    pub base_area: Decimal,

    /// 基础液位。
    pub base_level: Decimal,

    /// 容量。
    pub volume: Option<Decimal>,
}

/// 一个热缓冲区原型定义。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HeatBufferPrototype {
    /// 最高温度。
    pub max_temperature: Decimal,

    /// 默认温度。
    pub default_temperature: Decimal,

    /// 比热。
    pub specific_heat: Decimal,

    /// 最大传热率。
    pub max_transfer: Decimal,

    /// 最小温度梯度。
    pub min_temperature_gradient: Decimal,

    /// 最小工作温度。
    pub min_working_temperature: Decimal,

    /// 最低发光温度。
    pub minimum_glow_temperature: Decimal,
}
