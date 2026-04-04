use faculator_data::db::entity::{
    ItemEntity, MachineEntity, ModuleEntity, RecipeEntity, RecipeItemEntity, RecipeModuleEntity, item, machine, module,
    recipe, recipe_item, recipe_module,
};
use faculator_data::game::Game;
use faculator_data::game::item::Named;
use migration::{Migrator, MigratorTrait};
use sea_orm::{EntityTrait, NotSet, Set};
use std::collections::HashMap;
use std::path::Path;
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() -> color_eyre::Result<()> {
    color_eyre::install()?;
    let subscriber = FmtSubscriber::builder()
        .with_max_level(tracing::Level::DEBUG) // 或 INFO
        .finish();
    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let database_path = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../assets/db")
        .canonicalize()?
        .join("game.sqlite");
    let database_url = format!("sqlite://{}?mode=rwc", database_path.display());
    let connection = sea_orm::Database::connect(&database_url).await?;
    Migrator::down(&connection, None).await?;
    Migrator::up(&connection, None).await?;

    let content = tokio::fs::read_to_string(format!("{}/../game.json", env!("CARGO_MANIFEST_DIR"))).await?;
    let game: Game = serde_json::from_str(&content)?;

    let item_models = ItemEntity::insert_many(game.items.iter().map(|item| item::ActiveModel {
        id: NotSet,
        name: Set(item.name().to_owned()),
    }))
    .exec_with_returning_many(&connection)
    .await?;
    let item_id_map = item_models.iter().map(|item| (item.id, item)).collect::<HashMap<_, _>>();
    let item_name_map = item_models
        .iter()
        .map(|item| (item.name.clone(), item))
        .collect::<HashMap<_, _>>();

    let module_models = ModuleEntity::insert_many(game.modules.iter().flat_map(|module| {
        item_name_map.get(module.name()).map(|item| module::ActiveModel {
            id: NotSet,
            item_id: Set(item.id),
            production_bonus: Set(module.production_bonus),
            speed_bonus: Set(module.speed_bonus),
            power_bonus: Set(module.power_bonus),
            quality_bonus: Set(module.quality_bonus),
        })
    }))
    .exec_with_returning_many(&connection)
    .await?;
    let module_id_map = module_models
        .iter()
        .map(|module| (module.id, module))
        .collect::<HashMap<_, _>>();
    let module_name_map = module_models
        .iter()
        .flat_map(|module| item_id_map.get(&module.item_id).map(|item| (item.name.clone(), module)))
        .collect::<HashMap<_, _>>();

    let machine_models = MachineEntity::insert_many(game.machines.iter().flat_map(|machine| {
        item_name_map.get(machine.item.name()).map(|item| machine::ActiveModel {
            id: NotSet,
            item_id: Set(item.id),
            speed: Set(machine.speed),
            module_slots: Set(machine.module_slots),
        })
    }))
    .exec_with_returning_many(&connection)
    .await?;
    let machine_id_map = machine_models
        .iter()
        .map(|machine| (machine.id, machine))
        .collect::<HashMap<_, _>>();
    let machine_name_map = machine_models
        .iter()
        .flat_map(|machine| item_id_map.get(&machine.item_id).map(|item| (item.name.clone(), machine)))
        .collect::<HashMap<_, _>>();

    let recipe_models = RecipeEntity::insert_many(game.recipes.iter().flat_map(|recipe| {
        machine_name_map.get(recipe.machine.name()).map(|machine| recipe::ActiveModel {
            id: NotSet,
            name: Set(recipe.name.clone()),
            machine_id: Set(machine.id),
            time: Set(recipe.time),
        })
    }))
    .exec_with_returning_many(&connection)
    .await?;
    let recipe_id_map = recipe_models
        .iter()
        .map(|recipe| (recipe.id, recipe))
        .collect::<HashMap<_, _>>();
    let recipe_name_map = recipe_models
        .iter()
        .map(|recipe| (recipe.name.clone(), recipe))
        .collect::<HashMap<_, _>>();
    for recipe in game.recipes {
        let Some(recipe_model) = recipe_name_map.get(recipe.name()) else {
            continue;
        };
        if !recipe.inputs.is_empty() {
            RecipeItemEntity::insert_many(recipe.inputs.iter().flat_map(|recipe_item| {
                println!("{:#?}", recipe_model);
                item_name_map.get(recipe_item.item.name()).map(|item| {
                    println!("Item: {:#?}", item);
                    recipe_item::ActiveModel {
                        id: NotSet,
                        item_id: Set(item.id),
                        recipe_id: Set(recipe_model.id),
                        flow: Set(-1),
                        amount: Set(recipe_item.amount),
                    }
                })
            }))
            .exec_with_returning_many(&connection)
            .await?;
        }

        if !recipe.output.is_empty() {
            RecipeItemEntity::insert_many(recipe.output.iter().flat_map(|recipe_item| {
                item_name_map.get(recipe_item.item.name()).map(|item| recipe_item::ActiveModel {
                    id: NotSet,
                    item_id: Set(item.id),
                    recipe_id: Set(recipe_model.id),
                    flow: Set(1),
                    amount: Set(recipe_item.amount),
                })
            }))
            .exec_with_returning_many(&connection)
            .await?;
        }

        if !recipe.output.is_empty() {
            RecipeModuleEntity::insert_many(recipe.allowed_modules.iter().flat_map(|module| {
                module_name_map
                    .get(module.name())
                    .map(|module_model| recipe_module::ActiveModel {
                        id: NotSet,
                        recipe_id: Set(recipe_model.id),
                        module_id: Set(module_model.id),
                    })
            }))
            .exec_with_returning_many(&connection)
            .await?;
        }
    }

    Ok(())
}
