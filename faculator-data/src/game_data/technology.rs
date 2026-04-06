//! 顶层 `technologies` DTO。
//!
//! 科技对象是导出里关系最密集的一类原型之一：
//!
//! - `prerequisites[]` 指向其他科技
//! - `successors[]` 反向指向后继科技
//! - `effects[]` 解锁 recipe / quality / space_location 或修改某种游戏能力
//! - `research_unit_ingredients[]` 指向科技包物品
//!
//! 此外，导出器在这里使用了一个典型“小巧思”：
//!
//! - 当某个数组为空时，导出有时会给出 `{}` 而不是 `[]`
//!
//! 本模块会把这种格式统一规整为正常的空数组，方便后续入库与使用。
mod effect;
mod effect_modifier;
mod effect_type;
mod prototype;
mod research_trigger;
mod research_trigger_type;
mod research_unit_ingredient;

pub use effect::*;
pub use effect_modifier::*;
pub use effect_type::*;
pub use prototype::*;
pub use research_trigger::*;
pub use research_trigger_type::*;
pub use research_unit_ingredient::*;
