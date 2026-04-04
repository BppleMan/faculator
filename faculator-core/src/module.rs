use crate::game::item::{Item, Named};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Module {
    // 模块名称
    pub item: Item,
    // 对产能的加成效果, 可能为负
    pub production_bonus: f64,
    // 对速度的加成效果, 可能为负
    pub speed_bonus: f64,
    // 对能耗的加成效果, 可能为负
    pub power_bonus: f64,
    // 对品质的加成效果, 可能为负
    pub quality_bonus: f64,
}

impl Named for Module {
    fn name(&self) -> &str {
        &self.item.name
    }
}
