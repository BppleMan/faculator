use crate::quality::Quality;
use crate::quality_transform::{QualityRate, QualityTransform};
use bigdecimal::{BigDecimal, One, Zero};

#[derive(Debug, Clone)]
pub struct RecipeItem {
    pub name: String,

    /// amount 恒大于 0，这是通过游戏数据库拿到的数值。
    pub amount: BigDecimal,
}

#[derive(Debug, Clone)]
pub struct Recipe {
    pub ingredients: Vec<RecipeItem>,
    pub products: Vec<RecipeItem>,
}

#[derive(Debug, Clone)]
pub struct RecipeExecuteItem {
    pub item: String,

    /// 执行一次配方后，对该 item * quality 造成的真实变化。
    ///
    /// inputs 中为负数，outputs 中为正数。
    pub amount: BigDecimal,

    pub quality: Quality,
}

#[derive(Debug, Clone)]
pub struct RecipeExecuteResult {
    pub recipe: Recipe,

    /// 当前执行的是哪个品质配方。
    pub quality: Quality,

    /// None 表示没有品质插件。
    /// Some(q) 表示有品质插件，q 是品质提升概率，基底为 1。
    pub quality_rate: Option<QualityRate>,

    pub inputs: Vec<RecipeExecuteItem>,
    pub outputs: Vec<RecipeExecuteItem>,
}

/// 用矩阵展开的方式模拟执行一次某品质配方。
///
/// 核心公式：
/// inputs  = -Ingredients ⊗ QualityBasis(recipe_quality)
/// outputs = Products     ⊗ QualityRow(recipe_quality)
pub fn execute_recipe(
    recipe: Recipe,
    recipe_quality: Quality,
    quality_rate: Option<QualityRate>,
) -> RecipeExecuteResult {
    let ingredient_items: Vec<String> = recipe.ingredients.iter().map(|item| item.name.clone()).collect();

    let ingredient_amounts: Vec<BigDecimal> = recipe.ingredients.iter().map(|item| -item.amount.clone()).collect();

    let product_items: Vec<String> = recipe.products.iter().map(|item| item.name.clone()).collect();

    let product_amounts: Vec<BigDecimal> = recipe.products.iter().map(|item| item.amount.clone()).collect();

    // 输入侧：固定消耗 recipe_quality，不发生品质展开。
    let input_quality_basis = quality_basis_row(recipe_quality);

    // 输出侧：根据品质插件决定是否展开。
    let output_quality_row = output_quality_row(recipe_quality, quality_rate.as_ref());

    let input_matrix_row = kronecker_row(&ingredient_amounts, &input_quality_basis);
    let output_matrix_row = kronecker_row(&product_amounts, &output_quality_row);

    let inputs = materialize_item_quality_row(&ingredient_items, &input_matrix_row);
    let outputs = materialize_item_quality_row(&product_items, &output_matrix_row);

    RecipeExecuteResult {
        recipe,
        quality: recipe_quality,
        quality_rate,
        inputs,
        outputs,
    }
}

/// 品质基向量。
///
/// 例如：
/// Normal    -> [1, 0, 0, 0, 0]
/// Uncommon  -> [0, 1, 0, 0, 0]
fn quality_basis_row(quality: Quality) -> [BigDecimal; 5] {
    std::array::from_fn(|index| {
        let current_quality = Quality::ALL_QUALITIES[index];

        if current_quality == quality {
            BigDecimal::one()
        } else {
            BigDecimal::zero()
        }
    })
}

/// 输出品质展开行。
///
/// 如果没有品质插件，输出不展开，只保持原品质。
///
/// 如果有品质插件，则使用 QualityTransform 的当前品质行。
fn output_quality_row(recipe_quality: Quality, quality_rate: Option<&QualityRate>) -> [BigDecimal; 5] {
    match quality_rate {
        Some(rate) => {
            let transform = QualityTransform::from_q(rate.clone());

            std::array::from_fn(|index| {
                let output_quality = Quality::ALL_QUALITIES[index];
                transform.get_rate(recipe_quality, output_quality).clone()
            })
        }

        None => quality_basis_row(recipe_quality),
    }
}

/// 行向量 Kronecker product。
///
/// [a, b] ⊗ [x, y, z]
/// = [a*x, a*y, a*z, b*x, b*y, b*z]
fn kronecker_row(lhs: &[BigDecimal], rhs: &[BigDecimal; 5]) -> Vec<BigDecimal> {
    let mut result = Vec::with_capacity(lhs.len() * 5);

    for left in lhs {
        for right in rhs {
            result.push(left.clone() * right.clone());
        }
    }

    result
}

/// 把 item-major 的矩阵行转换成稀疏执行结果。
///
/// row 的布局是：
/// [
///   item0.normal,
///   item0.uncommon,
///   item0.rare,
///   item0.epic,
///   item0.legendary,
///
///   item1.normal,
///   item1.uncommon,
///   ...
/// ]
fn materialize_item_quality_row(items: &[String], row: &[BigDecimal]) -> Vec<RecipeExecuteItem> {
    assert_eq!(row.len(), items.len() * 5);

    let mut result = Vec::new();

    for (item_index, item) in items.iter().enumerate() {
        for quality in Quality::ALL_QUALITIES {
            let index = item_index * 5 + quality.as_quality_index();
            let amount = row[index].clone();

            if amount.is_zero() {
                continue;
            }

            result.push(RecipeExecuteItem {
                item: item.clone(),
                amount,
                quality,
            });
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn test_execute_recipe() {
        let recipe = Recipe {
            ingredients: vec![RecipeItem {
                name: "铁板".to_string(),
                amount: BigDecimal::from(2),
            }],
            products: vec![RecipeItem {
                name: "齿轮".to_string(),
                amount: BigDecimal::from(1),
            }],
        };

        let execute_result = execute_recipe(recipe, Quality::Normal, Some(QualityRate::from_str("0.1").unwrap()));
        println!("{:#?}", execute_result);
    }
}
