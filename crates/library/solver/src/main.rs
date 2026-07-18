// src/bin/solve_red_by_recipe_rate.rs

use good_lp::{Expression, ProblemVariables, Solution, SolverModel, constraint, default_solver, variable, variables};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // ==== 业务常量：拆成“工艺层”和“设备层” ====
    //
    // 关键思维转换：
    // 1. 工艺层：只描述“配方一次会吃什么、产什么”
    // 2. 设备层：只描述“单台机器每分钟能跑多少”
    //
    // 求解器只负责第 1 层；
    // 第 2 层在拿到解之后，再把“每分钟配方执行次数”折算成机器数。

    // ----------------------------------------------------------------
    // 工艺层（配方本身的输入 / 输出比例）
    // ----------------------------------------------------------------

    // 红瓶：1 次配方 -> 1 红瓶；消耗 1 齿轮 + 1 铜板
    const RED_PER_CRAFT: f64 = 1.0;
    const RED_NEED_GEAR_PER_CRAFT: f64 = 1.0;
    const RED_NEED_COPPER_PLATE_PER_CRAFT: f64 = 1.0;

    // 齿轮：1 次配方 -> 1 齿轮；消耗 2 铁板
    const GEAR_PER_CRAFT: f64 = 1.0;
    const GEAR_NEED_IRON_PLATE_PER_CRAFT: f64 = 2.0;

    // 炼板：1 次配方 -> 1 板；消耗 1 矿
    const IRON_PLATE_PER_CRAFT: f64 = 1.0;
    const IRON_PLATE_NEED_ORE_PER_CRAFT: f64 = 1.0;

    const COPPER_PLATE_PER_CRAFT: f64 = 1.0;
    const COPPER_PLATE_NEED_ORE_PER_CRAFT: f64 = 1.0;

    // 采矿：1 次“采矿配方” -> 1 矿
    const IRON_ORE_PER_CRAFT: f64 = 1.0;
    const COPPER_ORE_PER_CRAFT: f64 = 1.0;

    // 目标产能：红瓶 900 / min
    let target_red_per_min = 900.0;

    // ----------------------------------------------------------------
    // 设备层（单机产能）——注意：这里只用于“求解后换算机器数”
    // ----------------------------------------------------------------

    // 红瓶（科学瓶1）——假设“每台组装机”每分钟产出 15 个
    const RED_PER_ASSEMBLER_PER_MIN: f64 = 15.0;

    // 齿轮 —— 假设“每台组装机”每分钟 150 个
    const GEAR_PER_ASSEMBLER_PER_MIN: f64 = 150.0;

    // 电炉炼板 —— 假设“每台电炉”每分钟 37.5 个铁/铜板
    const PLATE_PER_FURNACE_PER_MIN: f64 = 37.5;

    // 大型采矿机 —— 假设“每台矿机”每分钟 150 个矿
    const ORE_PER_MINER_PER_MIN: f64 = 150.0;

    // ==== 建模：创建变量容器 ====
    let mut vars: ProblemVariables = variables!();

    // 关键思维转换：
    // 原版这些变量代表“机器台数”；
    // 现在这些变量代表“每分钟执行多少次该配方”。
    //
    // 为了方便你对比，我故意尽量保留原变量名。
    let x_red = vars.add(variable().name("crafts_red_per_min").min(0)); // 红瓶配方执行次数 / min
    let x_gear = vars.add(variable().name("crafts_gear_per_min").min(0)); // 齿轮配方执行次数 / min
    let x_furnace_iron = vars.add(variable().name("crafts_iron_plate_per_min").min(0)); // 炼铁板配方执行次数 / min
    let x_furnace_copper = vars.add(variable().name("crafts_copper_plate_per_min").min(0)); // 炼铜板配方执行次数 / min
    let x_miner_iron = vars.add(variable().name("crafts_iron_ore_per_min").min(0)); // 采铁矿配方执行次数 / min
    let x_miner_copper = vars.add(variable().name("crafts_copper_ore_per_min").min(0)); // 采铜矿配方执行次数 / min

    // ==== 目标函数：最小化“总开工量” ====
    //
    // 这里不是最小化机器数了，而是最小化总配方执行率。
    // 在本例里，因为中间层都用等式锁死，且红瓶目标是 >=，
    // 这个目标函数会自动把整套系统压到“刚好满足目标”的最小解。
    //
    // 若以后你想做“至少满足 + 最小冗余”，可以引入 surplus 变量继续扩展。
    let objective: Expression = x_red + x_gear + x_furnace_iron + x_furnace_copper + x_miner_iron + x_miner_copper;

    let mut problem = vars.minimise(objective).using(default_solver);

    // ==== 约束 1：红瓶目标产量达到目标 ====
    //
    // 这一步已经不再关心“每台机器 15/min”。
    // 这里只关心：红瓶配方每执行 1 次，产出 1 个红瓶。
    //
    // 因此：1 * x_red >= 900
    problem = problem.with(constraint!(RED_PER_CRAFT * x_red >= target_red_per_min));

    // ==== 约束 2：齿轮物料守恒 ====
    //
    // 齿轮配方产出 = 红瓶配方消耗
    // 1 * x_gear = 1 * x_red
    problem = problem.with(constraint!(GEAR_PER_CRAFT * x_gear == RED_NEED_GEAR_PER_CRAFT * x_red));

    // ==== 约束 3：铜板物料守恒 ====
    //
    // 炼铜板产出 = 红瓶消耗的铜板
    // 1 * x_furnace_copper = 1 * x_red
    problem = problem.with(constraint!(
        COPPER_PLATE_PER_CRAFT * x_furnace_copper == RED_NEED_COPPER_PLATE_PER_CRAFT * x_red
    ));

    // ==== 约束 4：铁板物料守恒（用于齿轮） ====
    //
    // 炼铁板产出 = 齿轮配方消耗的铁板
    // 1 * x_furnace_iron = 2 * x_gear
    problem = problem.with(constraint!(
        IRON_PLATE_PER_CRAFT * x_furnace_iron == GEAR_NEED_IRON_PLATE_PER_CRAFT * x_gear
    ));

    // ==== 约束 5：铁矿物料守恒（供炼铁） ====
    //
    // 采铁矿产出 = 炼铁板消耗的铁矿
    // 1 * x_miner_iron = 1 * x_furnace_iron
    problem = problem.with(constraint!(
        IRON_ORE_PER_CRAFT * x_miner_iron == IRON_PLATE_NEED_ORE_PER_CRAFT * x_furnace_iron
    ));

    // ==== 约束 6：铜矿物料守恒（供炼铜） ====
    //
    // 采铜矿产出 = 炼铜板消耗的铜矿
    // 1 * x_miner_copper = 1 * x_furnace_copper
    problem = problem.with(constraint!(
        COPPER_ORE_PER_CRAFT * x_miner_copper == COPPER_PLATE_NEED_ORE_PER_CRAFT * x_furnace_copper
    ));

    // ==== 求解 ====
    let solution = problem.solve()?;

    // ==== 取回“每分钟配方执行次数” ====
    let v_red = solution.value(x_red);
    let v_gear = solution.value(x_gear);
    let v_fi = solution.value(x_furnace_iron);
    let v_fc = solution.value(x_furnace_copper);
    let v_mi = solution.value(x_miner_iron);
    let v_mc = solution.value(x_miner_copper);

    println!("=== 工艺层解（红瓶目标：{}/min）===", target_red_per_min as i64);
    println!("红瓶配方执行率   = {:>8.3} 次/min", v_red);
    println!("齿轮配方执行率   = {:>8.3} 次/min", v_gear);
    println!("炼铁板执行率     = {:>8.3} 次/min", v_fi);
    println!("炼铜板执行率     = {:>8.3} 次/min", v_fc);
    println!("采铁矿执行率     = {:>8.3} 次/min", v_mi);
    println!("采铜矿执行率     = {:>8.3} 次/min", v_mc);

    // ==== 设备层派生：把“配方执行率”换算成“机器台数” ====
    //
    // 注意：机器不再参与求解，只在这里作为派生结果出现。
    let m_red = v_red / RED_PER_ASSEMBLER_PER_MIN;
    let m_gear = v_gear / GEAR_PER_ASSEMBLER_PER_MIN;
    let m_fi = v_fi / PLATE_PER_FURNACE_PER_MIN;
    let m_fc = v_fc / PLATE_PER_FURNACE_PER_MIN;
    let m_mi = v_mi / ORE_PER_MINER_PER_MIN;
    let m_mc = v_mc / ORE_PER_MINER_PER_MIN;

    println!("\n=== 设备层换算（理论连续值）===");
    println!("红瓶组装机     = {:>8.3} 台", m_red);
    println!("齿轮组装机     = {:>8.3} 台", m_gear);
    println!("电炉（铁板）   = {:>8.3} 台", m_fi);
    println!("电炉（铜板）   = {:>8.3} 台", m_fc);
    println!("矿机（铁矿）   = {:>8.3} 台", m_mi);
    println!("矿机（铜矿）   = {:>8.3} 台", m_mc);

    println!("\n=== 若按实际摆放取整（向上取整）===");
    println!("红瓶组装机     = {:>6.0} 台", m_red.ceil());
    println!("齿轮组装机     = {:>6.0} 台", m_gear.ceil());
    println!("电炉（铁板）   = {:>6.0} 台", m_fi.ceil());
    println!("电炉（铜板）   = {:>6.0} 台", m_fc.ceil());
    println!("矿机（铁矿）   = {:>6.0} 台", m_mi.ceil());
    println!("矿机（铜矿）   = {:>6.0} 台", m_mc.ceil());

    // ====（可选）做个快速校验：校验“物料守恒” ====
    let red_out = RED_PER_CRAFT * v_red;
    let gear_out = GEAR_PER_CRAFT * v_gear;
    let gear_need = RED_NEED_GEAR_PER_CRAFT * v_red;

    let cu_plate_out = COPPER_PLATE_PER_CRAFT * v_fc;
    let cu_plate_need = RED_NEED_COPPER_PLATE_PER_CRAFT * v_red;

    let fe_plate_out = IRON_PLATE_PER_CRAFT * v_fi;
    let fe_plate_need = GEAR_NEED_IRON_PLATE_PER_CRAFT * v_gear;

    let fe_ore_out = IRON_ORE_PER_CRAFT * v_mi;
    let fe_ore_need = IRON_PLATE_NEED_ORE_PER_CRAFT * v_fi;

    let cu_ore_out = COPPER_ORE_PER_CRAFT * v_mc;
    let cu_ore_need = COPPER_PLATE_NEED_ORE_PER_CRAFT * v_fc;

    println!("\n=== 工艺层校验（应为 =，只有红瓶目标是 ≥）===");
    println!("红瓶产出 {:>8.3} / 目标 {:>8.3}", red_out, target_red_per_min);
    println!("齿轮产出 {:>8.3} / 需求 {:>8.3}", gear_out, gear_need);
    println!("铜板产出 {:>8.3} / 需求 {:>8.3}", cu_plate_out, cu_plate_need);
    println!("铁板产出 {:>8.3} / 需求 {:>8.3}", fe_plate_out, fe_plate_need);
    println!("铁矿产出 {:>8.3} / 需求 {:>8.3}", fe_ore_out, fe_ore_need);
    println!("铜矿产出 {:>8.3} / 需求 {:>8.3}", cu_ore_out, cu_ore_need);

    Ok(())
}
