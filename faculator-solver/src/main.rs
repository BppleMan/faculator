// src/bin/solve_red.rs

// 引入 good_lp 的全部常用符号（变量定义、约束、求解、目标函数等）
use good_lp::{Expression, ProblemVariables, Solution, SolverModel, constraint, default_solver, variable, variables};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // ==== 业务常量（基于不装模块的基础机器数据；你后续可从 game.toml 读取替代）====

    // 红瓶（科学瓶1）——假设“每台组装机”每分钟产出 15 个
    // 说明：这是一个示例速率，真实值你可从自己的建模里读取并替换
    const RED_PER_ASSEMBLER_PER_MIN: f64 = 15.0;

    // 齿轮 —— 假设“每台组装机”每分钟 150 个（0.5s 基础配方 × 1.25 速度 ≈ 2.5/s）
    const GEAR_PER_ASSEMBLER_PER_MIN: f64 = 150.0;

    // 电炉炼板 —— 假设“每台电炉”每分钟 37.5 个铁/铜板（craft 3.2s，速度2.0 → 1.6s/个）
    const PLATE_PER_FURNACE_PER_MIN: f64 = 37.5;

    // 大型采矿机 —— 假设“每台矿机”每分钟 150 个矿（1/s × 2.5 速度 → 2.5/s）
    const ORE_PER_MINER_PER_MIN: f64 = 150.0;

    // 混合整数模型要达成的目标产能：红瓶 900 / min
    let target_red_per_min = 900.0;

    // ==== 建模：创建变量容器 ====
    let mut vars: ProblemVariables = variables!();

    // 对每一种“机器类型×配方”建立一个“整数台数”变量（非负、取整）
    // .name("...") 方便调试；.integer() 声明为整数；.min(0) 表示 ≥ 0
    let x_red = vars.add(variable().name("assemblers_red").integer().min(0)); // 红瓶组装机台数
    let x_gear = vars.add(variable().name("assemblers_gear").integer().min(0)); // 齿轮组装机台数
    let x_furnace_iron = vars.add(variable().name("furnaces_iron_plate").integer().min(0)); // 炼铁板电炉台数
    let x_furnace_copper = vars.add(variable().name("furnaces_copper_plate").integer().min(0)); // 炼铜板电炉台数
    let x_miner_iron = vars.add(variable().name("miners_iron_ore").integer().min(0)); // 铁矿矿机台数
    let x_miner_copper = vars.add(variable().name("miners_copper_ore").integer().min(0)); // 铜矿矿机台数

    // ==== 目标函数：最小化“机器总台数” ====
    // 注意：这里简单地把所有机器等权重相加；你也可以给不同机器加不同权重（功耗/占地等）
    let objective: Expression = x_red + x_gear + x_furnace_iron + x_furnace_copper + x_miner_iron + x_miner_copper;

    // 使用默认求解器（启用了 coin_cbc 特性时就是 CBC）
    let mut problem = vars.minimise(objective).using(default_solver);

    // ==== 约束 1：红瓶产量达到目标 ====
    // “每台红瓶机 15/min × 台数 ≥ 目标 900/min”
    problem = problem.with(constraint!(RED_PER_ASSEMBLER_PER_MIN * x_red >= target_red_per_min));

    // ==== 约束 2：齿轮供给足够 ====
    // 每台红瓶机每分钟需要 15 个齿轮（等价于：红瓶线对齿轮的总需求 = 15 × 红瓶机台数）
    // 齿轮产出来自齿轮机：150/min × 齿轮机台数
    // 因此：150 × x_gear ≥ 15 × x_red
    problem = problem.with(constraint!(GEAR_PER_ASSEMBLER_PER_MIN * x_gear >= 15.0 * x_red));

    // ==== 约束 3：铜板供给足够 ====
    // 假设红瓶每个消耗 1 块铜板，且每台红瓶机 15/min → 铜板需求 = 15 × x_red
    // 炼铜板电炉产能：37.5/min × 电炉台数
    // 因此：37.5 × x_furnace_copper ≥ 15 × x_red
    problem = problem.with(constraint!(
        PLATE_PER_FURNACE_PER_MIN * x_furnace_copper >= 15.0 * x_red
    ));

    // ==== 约束 4：铁板供给足够（用于齿轮） ====
    // 1 个齿轮消耗 2 个铁板；齿轮机每分钟 150 个齿轮 → 铁板需求 = 300 × x_gear
    // 炼铁板电炉产能：37.5/min × 电炉台数
    // 因此：37.5 × x_furnace_iron ≥ 300 × x_gear
    problem = problem.with(constraint!(
        PLATE_PER_FURNACE_PER_MIN * x_furnace_iron >= 300.0 * x_gear
    ));

    // ==== 约束 5：铁矿供给足够（供炼铁） ====
    // 炼铁板电炉每分钟消耗 37.5 个铁矿；总铁矿需求 = 37.5 × x_furnace_iron
    // 矿机产能：150/min × 矿机台数
    // 因此：150 × x_miner_iron ≥ 37.5 × x_furnace_iron
    problem = problem.with(constraint!(
        ORE_PER_MINER_PER_MIN * x_miner_iron >= PLATE_PER_FURNACE_PER_MIN * x_furnace_iron
    ));

    // ==== 约束 6：铜矿供给足够（供炼铜） ====
    // 炼铜板电炉每分钟消耗 37.5 个铜矿；总铜矿需求 = 37.5 × x_furnace_copper
    // 矿机产能：150/min × 矿机台数
    // 因此：150 × x_miner_copper ≥ 37.5 × x_furnace_copper
    problem = problem.with(constraint!(
        ORE_PER_MINER_PER_MIN * x_miner_copper >= PLATE_PER_FURNACE_PER_MIN * x_furnace_copper
    ));

    // ==== 求解 ====
    let solution = problem.solve()?; // 交给 CBC 做混合整数求解

    // ==== 取回整数最优解并打印 ====
    let v_red = solution.value(x_red);
    let v_gear = solution.value(x_gear);
    let v_fi = solution.value(x_furnace_iron);
    let v_fc = solution.value(x_furnace_copper);
    let v_mi = solution.value(x_miner_iron);
    let v_mc = solution.value(x_miner_copper);

    println!("=== 最小机器配置（红瓶目标：{}/min）===", target_red_per_min as i64);
    println!("红瓶组装机     = {:>6.0} 台", v_red);
    println!("齿轮组装机     = {:>6.0} 台", v_gear);
    println!("电炉（铁板）   = {:>6.0} 台", v_fi);
    println!("电炉（铜板）   = {:>6.0} 台", v_fc);
    println!("矿机（铁矿）   = {:>6.0} 台", v_mi);
    println!("矿机（铜矿）   = {:>6.0} 台", v_mc);
    println!(
        "机器总数（目标函数） = {:>6.0} 台",
        v_red + v_gear + v_fi + v_fc + v_mi + v_mc
    );

    // ====（可选）做个快速校验：把关键流量算一遍，确保不欠账 ====
    let red_out = RED_PER_ASSEMBLER_PER_MIN * v_red;
    let gear_out = GEAR_PER_ASSEMBLER_PER_MIN * v_gear;
    let gear_need = 15.0 * v_red; // 红瓶对齿轮的需求
    let cu_out = PLATE_PER_FURNACE_PER_MIN * v_fc;
    let cu_need = 15.0 * v_red; // 红瓶对铜板的需求
    let fe_plate_out = PLATE_PER_FURNACE_PER_MIN * v_fi;
    let fe_plate_need = 300.0 * v_gear; // 齿轮对铁板的需求
    let fe_ore_out = ORE_PER_MINER_PER_MIN * v_mi;
    let fe_ore_need = PLATE_PER_FURNACE_PER_MIN * v_fi; // 炼铁板对铁矿的需求
    let cu_ore_out = ORE_PER_MINER_PER_MIN * v_mc;
    let cu_ore_need = PLATE_PER_FURNACE_PER_MIN * v_fc; // 炼铜板对铜矿的需求

    println!("\n=== 产能校验（应 ≥ 需求）===");
    println!("红瓶产出 {:>8.1} / 需求 {:>8.1}", red_out, target_red_per_min);
    println!("齿轮产出 {:>8.1} / 需求 {:>8.1}", gear_out, gear_need);
    println!("铜板产出 {:>8.1} / 需求 {:>8.1}", cu_out, cu_need);
    println!("铁板产出 {:>8.1} / 需求 {:>8.1}", fe_plate_out, fe_plate_need);
    println!("铁矿产出 {:>8.1} / 需求 {:>8.1}", fe_ore_out, fe_ore_need);
    println!("铜矿产出 {:>8.1} / 需求 {:>8.1}", cu_ore_out, cu_ore_need);

    Ok(())
}
