use crate::quality::Quality;
use bigdecimal::{BigDecimal, One, Zero};
use std::fmt::Display;

pub type QualityRate = BigDecimal;
pub type QualityMatrix = [[QualityRate; 5]; 5];

pub struct QualityTransform {
    pub quality_rate: QualityRate,
    transformer: QualityMatrix,
}

impl QualityTransform {
    pub fn from_q(quality_rate: QualityRate) -> QualityTransform {
        let transformer = std::array::from_fn(|input| {
            std::array::from_fn(|output| {
                Self::rate(
                    quality_rate.clone(),
                    Quality::index_of(input),
                    Quality::index_of(output),
                    Quality::Legendary,
                )
            })
        });

        Self {
            quality_rate,
            transformer,
        }
    }

    pub fn get_rate(&self, input: Quality, output: Quality) -> &QualityRate {
        &self.transformer[input.as_quality_index()][output.as_quality_index()]
    }

    /// q 使用概率基底 1。
    ///
    /// 例如：
    /// q = 0.10  表示 10%
    /// q = 0.248 表示 24.8%
    ///
    /// input/output/max:
    ///
    /// 返回值也是概率基底 1。
    fn rate(q: QualityRate, input: Quality, output: Quality, max: Quality) -> QualityRate {
        debug_assert!(input <= max, "input quality out of range");
        debug_assert!(output <= max, "output quality out of range");
        debug_assert!(q >= BigDecimal::zero(), "q must be >= 0");
        debug_assert!(q <= BigDecimal::one(), "q must be <= 1");

        match (input, output) {
            // j < i
            (i, j) if j < i => BigDecimal::zero(),

            // i = j = max
            //
            // 传奇是吸收态，传奇 -> 传奇 恒等于 1。
            // 这个分支必须放在 output == input 之前。
            (i, j) if i == max && j == max => BigDecimal::one(),

            // j = i < max
            //
            // 第一次 q 判定失败，保持原品质。
            (i, j) if i == j => BigDecimal::one() - q,

            // j = max, i < max
            //
            // 到达最高品质后封顶，不再乘 0.9。
            //
            // q * 0.1^(max - input - 1)
            (i, j) if j == max && i < max => {
                let n = max.as_quality_index() - i.as_quality_index() - 1;
                q / BigDecimal::from(10).powi(n as i64)
            }

            // i < j < max
            //
            // q * 0.9 * 0.1^(output - input - 1)
            //
            // 等价于：
            // q * 9 / 10^(output - input)
            (i, j) if i < j && j < max => {
                let n = j.as_quality_index() - i.as_quality_index();
                q * BigDecimal::from(9) / BigDecimal::from(10).powi(n as i64)
            }

            _ => BigDecimal::zero(),
        }
    }
}

impl Display for QualityTransform {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let output = Quality::ALL_QUALITIES
            .into_iter()
            .map(|input| {
                Quality::ALL_QUALITIES
                    .into_iter()
                    .map(|output| format!("{:>8.4}%", self.get_rate(input, output) * 100))
                    .collect::<Vec<_>>()
                    .join(" ")
            })
            .collect::<Vec<_>>()
            .join("\n");
        write!(f, "{}", output)
    }
}
