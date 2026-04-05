use serde::{Deserialize, Serialize};

/// 计算层机器抽象，暂作存根。后续由 faculator-solver 基于游戏实体（Entity）组装。
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Machine {
    pub name: String,
    pub speed: f64,
    pub module_slots: u32,
}
