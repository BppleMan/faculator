use serde::{Deserialize, Serialize};

/// 计算层模块抽象，暂作存根。后续由 faculator-solver 基于游戏物品（Item）组装。
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Module {
    pub name: String,
    pub production_bonus: f64,
    pub speed_bonus: f64,
    pub power_bonus: f64,
    pub quality_bonus: f64,
}
