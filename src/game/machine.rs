use crate::game::item::{Item, Named};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Machine {
    // 机器名称
    pub item: Item,
    // 制造速度
    pub speed: f64,
    // 能耗
    // pub power: f64,
    // 模块槽位
    pub module_slots: u32,
}

impl Named for Machine {
    fn name(&self) -> &str {
        &self.item.name
    }
}
