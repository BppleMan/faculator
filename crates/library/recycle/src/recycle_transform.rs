use crate::quality::Quality;
use crate::quality_transform::{QualityRate, QualityTransform};
use bigdecimal::{BigDecimal, One, Zero};

pub type FeedbackMatrix = [[QualityRate; 4]; 4];
pub type YieldVector = [QualityRate; 4];

pub struct RecycleTransform {
    /// K[input_quality][output_quality]
    ///
    /// 投入 1 单位 input_quality 材料后，
    /// 一轮制造 + 回收，会反馈出多少 output_quality 材料。
    pub k: FeedbackMatrix,

    /// g[input_quality]
    ///
    /// 投入 1 单位 input_quality 材料后，
    /// 一轮制造 + 回收，当轮最终产出多少传奇目标产品。
    pub g: YieldVector,
}

pub fn simulate_one_input_quality(
    input_quality: Quality,
    craft_transform: &QualityTransform,
    recycle_transform: &QualityTransform,
    material_per_product: QualityRate,
    recycle_return_rate: QualityRate,
) -> ([QualityRate; 4], QualityRate) {
    assert_ne!(input_quality, Quality::Legendary);

    // 投入 1 单位材料，可以制造多少目标产品。
    let product_amount: BigDecimal = BigDecimal::one() / material_per_product.clone();

    let mut k_row: [BigDecimal; 4] = std::array::from_fn(|_| BigDecimal::zero());
    let mut g: BigDecimal = BigDecimal::zero();

    for product_quality in Quality::ALL_QUALITIES {
        // 制造阶段产出多少该品质产品。
        let product_amount_of_quality =
            product_amount.clone() * craft_transform.get_rate(input_quality, product_quality);

        if matches!(product_quality, Quality::Legendary) {
            // 制造阶段直接得到的传奇产品，直接进入收益。
            g += product_amount_of_quality;
            continue;
        }

        // 这一批该品质产品进入回收后，理论上可返还的材料总量；
        // 此时还没有经过回收阶段的品质 roll。
        let recycle_material_amount =
            product_amount_of_quality * material_per_product.clone() * recycle_return_rate.clone();

        for recycle_quality in Quality::ALL_QUALITIES {
            let recycle_amount_of_quality =
                recycle_material_amount.clone() * recycle_transform.get_rate(product_quality, recycle_quality);

            match recycle_quality {
                // 回收阶段得到的是传奇材料；
                // g 记录的是传奇目标产品，所以需要把材料数量换算成产品数量。
                Quality::Legendary => g += recycle_amount_of_quality / material_per_product.clone(),

                // K 记录的是一轮后反馈回来的非传奇材料量。
                _ => k_row[recycle_quality.as_quality_index()] += recycle_amount_of_quality,
            }
        }
    }

    (k_row, g)
}

pub type QualityFeedbackKernel = [[QualityRate; 4]; 4];
pub type QualityYieldKernel = [QualityRate; 4];

pub struct QualityRecycleKernel {
    /// feedback[input_quality][output_quality]
    ///
    /// 回馈率：
    /// 跑一轮制造 + 回收后，最终反馈回来的非传奇材料，
    /// 相对于「投入材料量」的比例。
    ///
    /// 注意这里不是纯概率分布；
    /// 它已经乘入了 recycle_return_rate，
    /// 所以一行总和通常小于 1。
    pub feedback_transformer: QualityFeedbackKernel,

    /// direct_legendary_product_rate[input_quality]
    ///
    /// 制造阶段直接 roll 出传奇产品的概率。
    ///
    /// 这里还不是传奇产品数量；
    /// 真实数量需要乘 product_amount / ingredient_amount。
    pub craft_legendary_rate: QualityYieldKernel,

    /// legendary_material_feedback_rate[input_quality]
    ///
    /// 非传奇产品进入回收后，roll 出传奇材料的比例。
    ///
    /// 这里记录的是传奇材料反馈率；
    /// 如果要换算成传奇目标产品，需要再乘 product_amount / ingredient_amount。
    pub recycle_legendary_rate: QualityYieldKernel,
}

pub fn simulate_one_quality_kernel(
    input_quality: Quality,
    craft_transform: &QualityTransform,
    recycle_transform: &QualityTransform,
    recycle_return_rate: QualityRate,
) -> ([QualityRate; 4], QualityRate, QualityRate) {
    assert_ne!(input_quality, Quality::Legendary);

    let mut feedback_rate_row: [BigDecimal; 4] = std::array::from_fn(|_| BigDecimal::zero());
    let mut craft_legendary_rate = BigDecimal::zero();
    let mut recycle_legendary_rate = BigDecimal::zero();

    for product_quality in Quality::ALL_QUALITIES {
        let craft_rate = craft_transform.get_rate(input_quality, product_quality);

        if matches!(product_quality, Quality::Legendary) {
            craft_legendary_rate += craft_rate;
            continue;
        }

        for recycle_quality in Quality::ALL_QUALITIES {
            let recycle_rate =
                craft_rate * recycle_return_rate.clone() * recycle_transform.get_rate(product_quality, recycle_quality);
            match recycle_quality {
                Quality::Legendary => recycle_legendary_rate += recycle_rate,
                _ => feedback_rate_row[recycle_quality.as_quality_index()] += recycle_rate,
            }
        }
    }

    (feedback_rate_row, craft_legendary_rate, recycle_legendary_rate)
}
