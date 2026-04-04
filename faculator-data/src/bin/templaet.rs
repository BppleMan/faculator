use faculator_data::game::Game;
use faculator_data::game::item::Item;
use faculator_data::game::machine::Machine;
use faculator_data::game::module::Module;
use faculator_data::game::recipe::{Recipe, RecipeItem};

fn main() {
    // 物品
    let iron_item = Item::new("铁矿");
    let iron_plate_item = Item::new("铁板");
    let iron_gear_item = Item::new("铁齿轮");
    let copper_item = Item::new("铜矿");
    let copper_plate_item = Item::new("铜板");
    let red_bottle_item = Item::new("红瓶");
    let big_drill_item = Item::new("大型采矿机");
    let furnace_item = Item::new("电炉");
    let assembler_item = Item::new("组装机型");
    let speed_module_item = Item::new("速度模块");
    let productivity_module_item = Item::new("生产力模块");
    let quality_module_item = Item::new("品质模块");

    // 机器
    let big_drill_machine = Machine {
        item: big_drill_item.clone(),
        speed: 2.5,
        module_slots: 4,
    };
    let furnace_machine = Machine {
        item: furnace_item.clone(),
        speed: 2.0,
        module_slots: 2,
    };
    let assembler_machine = Machine {
        item: assembler_item.clone(),
        speed: 1.25,
        module_slots: 4,
    };

    // 模块
    let speed_module = Module {
        item: speed_module_item.clone(),
        production_bonus: 0.0,
        speed_bonus: 0.5,
        power_bonus: 0.7,
        quality_bonus: -2.5,
    };
    let productivity_module = Module {
        item: productivity_module_item.clone(),
        production_bonus: 0.1,
        speed_bonus: -0.15,
        power_bonus: 0.8,
        quality_bonus: 0.0,
    };
    let quality_module = Module {
        item: quality_module_item.clone(),
        production_bonus: 0.0,
        speed_bonus: -5.0,
        power_bonus: 0.0,
        quality_bonus: 2.5,
    };

    // 配方
    let iron_recipe = Recipe {
        name: "铁矿 开采".to_string(),
        machine: big_drill_machine.clone(),
        time: 1.0,
        inputs: vec![],
        output: vec![RecipeItem {
            item: iron_item.clone(),
            amount: 1,
        }],
        allowed_modules: vec![speed_module.clone(), productivity_module.clone(), quality_module.clone()],
    };
    let iron_plate_recipe = Recipe {
        name: "铁板 制造".to_string(),
        machine: furnace_machine.clone(),
        time: 3.2,
        inputs: vec![RecipeItem {
            item: iron_item.clone(),
            amount: 1,
        }],
        output: vec![RecipeItem {
            item: iron_plate_item.clone(),
            amount: 1,
        }],
        allowed_modules: vec![speed_module.clone(), productivity_module.clone(), quality_module.clone()],
    };
    let iron_gear_recipe = Recipe {
        name: "铁齿轮 制造".to_string(),
        machine: assembler_machine.clone(),
        time: 0.5,
        inputs: vec![RecipeItem {
            item: iron_plate_item.clone(),
            amount: 2,
        }],
        output: vec![RecipeItem {
            item: iron_gear_item.clone(),
            amount: 1,
        }],
        allowed_modules: vec![speed_module.clone(), productivity_module.clone(), quality_module.clone()],
    };
    let copper_recipe = Recipe {
        name: "铜矿 开采".to_string(),
        machine: big_drill_machine.clone(),
        time: 1.0,
        inputs: vec![],
        output: vec![RecipeItem {
            item: copper_item.clone(),
            amount: 1,
        }],
        allowed_modules: vec![speed_module.clone(), productivity_module.clone(), quality_module.clone()],
    };
    let copper_plate_recipe = Recipe {
        name: "铜板 制造".to_string(),
        machine: furnace_machine.clone(),
        time: 3.2,
        inputs: vec![RecipeItem {
            item: copper_item.clone(),
            amount: 1,
        }],
        output: vec![RecipeItem {
            item: copper_plate_item.clone(),
            amount: 1,
        }],
        allowed_modules: vec![speed_module.clone(), productivity_module.clone(), quality_module.clone()],
    };
    let red_bottle_recipe = Recipe {
        name: "红瓶 制造".to_string(),
        machine: assembler_machine.clone(),
        time: 5.0,
        inputs: vec![
            RecipeItem {
                item: iron_gear_item.clone(),
                amount: 1,
            },
            RecipeItem {
                item: copper_plate_item.clone(),
                amount: 1,
            },
        ],
        output: vec![RecipeItem {
            item: red_bottle_item.clone(),
            amount: 1,
        }],
        allowed_modules: vec![speed_module.clone(), productivity_module.clone(), quality_module.clone()],
    };

    let game = Game {
        items: vec![
            iron_item,
            iron_plate_item,
            iron_gear_item,
            copper_item,
            copper_plate_item,
            red_bottle_item,
            big_drill_item,
            furnace_item,
            assembler_item,
            speed_module_item,
            productivity_module_item,
            quality_module_item,
        ],
        machines: vec![big_drill_machine, furnace_machine, assembler_machine],
        modules: vec![speed_module, productivity_module, quality_module],
        recipes: vec![
            iron_recipe,
            iron_plate_recipe,
            iron_gear_recipe,
            copper_recipe,
            copper_plate_recipe,
            red_bottle_recipe,
        ],
    };

    let content = serde_json::to_string_pretty(&game).unwrap();
    println!("{}", content);
    std::fs::write("game.json", &content).unwrap();

    let loaded_game: Game = serde_json::from_str(&content).unwrap();
    println!("{:#?}", loaded_game);
}
