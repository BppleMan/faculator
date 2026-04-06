use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

const UP_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS game (
    mods_hash TEXT PRIMARY KEY NOT NULL,
    export_mod_version TEXT NOT NULL,
    factorio_version TEXT NOT NULL,
    built_at TEXT NOT NULL,
    game_data_hash TEXT
);

CREATE TABLE IF NOT EXISTS active_mod (
    game_mods_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    PRIMARY KEY (game_mods_hash, name),
    FOREIGN KEY (game_mods_hash) REFERENCES game(mods_hash)
);

CREATE TABLE IF NOT EXISTS recipe_category (
    name TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS fuel_category (
    name TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS resource_category (
    name TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS module_category (
    name TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment_category (
    name TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS item_group (
    name TEXT PRIMARY KEY NOT NULL,
    item_group_type TEXT NOT NULL,
    "order" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS item_subgroup (
    name TEXT PRIMARY KEY NOT NULL,
    group_name TEXT NOT NULL,
    "order" TEXT NOT NULL,
    FOREIGN KEY (group_name) REFERENCES item_group(name)
);

CREATE TABLE IF NOT EXISTS space_location (
    name TEXT PRIMARY KEY NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    solar_power_in_space INTEGER NOT NULL,
    position_x DECIMAL NOT NULL,
    position_y DECIMAL NOT NULL,
    day_night_cycle INTEGER,
    magnetic_field INTEGER,
    solar_power INTEGER,
    pressure INTEGER,
    gravity INTEGER,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name)
);

CREATE TABLE IF NOT EXISTS quality (
    name TEXT PRIMARY KEY NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    level INTEGER NOT NULL,
    color_r DECIMAL NOT NULL,
    color_g DECIMAL NOT NULL,
    color_b DECIMAL NOT NULL,
    color_a DECIMAL NOT NULL,
    next TEXT,
    next_probability DECIMAL NOT NULL,
    beacon_power_usage_multiplier DECIMAL NOT NULL,
    mining_drill_resource_drain_multiplier DECIMAL NOT NULL,
    science_pack_drain_multiplier DECIMAL NOT NULL,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name),
    FOREIGN KEY (next) REFERENCES quality(name)
);

CREATE TABLE IF NOT EXISTS equipment_grid (
    name TEXT PRIMARY KEY NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    locked BOOLEAN NOT NULL,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name)
);

CREATE TABLE IF NOT EXISTS equipment (
    name TEXT PRIMARY KEY NOT NULL,
    equipment_type TEXT NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    energy_production DECIMAL NOT NULL,
    energy_per_shield INTEGER NOT NULL,
    shape_width INTEGER NOT NULL,
    shape_height INTEGER NOT NULL,
    take_result TEXT,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name)
);

CREATE TABLE IF NOT EXISTS entity (
    name TEXT PRIMARY KEY NOT NULL,
    entity_type TEXT NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    crafting_speed DECIMAL,
    module_inventory_size INTEGER,
    energy_usage DECIMAL,
    max_energy_usage DECIMAL,
    max_energy_production DECIMAL,
    max_power_output DECIMAL,
    effectivity DECIMAL,
    fluid_usage_per_tick DECIMAL,
    maximum_temperature DECIMAL,
    burns_fluid BOOLEAN,
    scale_fluid_usage BOOLEAN,
    destroy_non_fuel_fluid BOOLEAN,
    target_temperature DECIMAL,
    boiler_mode TEXT,
    neighbour_bonus DECIMAL,
    solar_panel_performance_at_day DECIMAL,
    solar_panel_performance_at_night DECIMAL,
    mining_speed DECIMAL,
    mining_drill_radius DECIMAL,
    researching_speed DECIMAL,
    science_pack_drain_rate_percent DECIMAL,
    distribution_effectivity DECIMAL,
    distribution_effectivity_bonus_per_quality_level DECIMAL,
    beacon_counter TEXT,
    supply_area_distance DECIMAL,
    next_upgrade TEXT,
    quality_affects_module_slots BOOLEAN,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name),
    FOREIGN KEY (next_upgrade) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS item (
    name TEXT PRIMARY KEY NOT NULL,
    item_type TEXT NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    stack_size INTEGER NOT NULL,
    weight DECIMAL NOT NULL,
    default_import_location TEXT NOT NULL,
    fuel_value INTEGER NOT NULL,
    fuel_acceleration_multiplier DECIMAL NOT NULL,
    fuel_top_speed_multiplier DECIMAL NOT NULL,
    fuel_emissions_multiplier INTEGER NOT NULL,
    fuel_category TEXT,
    module_category TEXT,
    tier INTEGER,
    place_result TEXT,
    place_as_equipment_result TEXT,
    spoil_result TEXT,
    burnt_result TEXT,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name),
    FOREIGN KEY (default_import_location) REFERENCES space_location(name),
    FOREIGN KEY (fuel_category) REFERENCES fuel_category(name),
    FOREIGN KEY (module_category) REFERENCES module_category(name),
    FOREIGN KEY (place_result) REFERENCES entity(name),
    FOREIGN KEY (place_as_equipment_result) REFERENCES equipment(name),
    FOREIGN KEY (spoil_result) REFERENCES item(name),
    FOREIGN KEY (burnt_result) REFERENCES item(name)
);

CREATE TABLE IF NOT EXISTS fluid (
    name TEXT PRIMARY KEY NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    default_temperature DECIMAL NOT NULL,
    max_temperature DECIMAL NOT NULL,
    heat_capacity DECIMAL NOT NULL,
    fuel_value INTEGER,
    emissions_multiplier DECIMAL,
    gas_temperature TEXT,
    base_color_r DECIMAL,
    base_color_g DECIMAL,
    base_color_b DECIMAL,
    base_color_a DECIMAL,
    flow_color_r DECIMAL,
    flow_color_g DECIMAL,
    flow_color_b DECIMAL,
    flow_color_a DECIMAL,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name)
);

CREATE TABLE IF NOT EXISTS recipe (
    name TEXT PRIMARY KEY NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    category TEXT NOT NULL,
    energy DECIMAL NOT NULL,
    main_product_type TEXT,
    main_product_name TEXT,
    enabled BOOLEAN NOT NULL,
    allow_decomposition BOOLEAN NOT NULL,
    allow_as_intermediate BOOLEAN NOT NULL,
    allow_intermediates BOOLEAN NOT NULL,
    always_show_made_in BOOLEAN NOT NULL,
    always_show_products BOOLEAN NOT NULL,
    show_amount_in_title BOOLEAN NOT NULL,
    emissions_multiplier DECIMAL NOT NULL,
    maximum_productivity DECIMAL,
    hide_from_player_crafting BOOLEAN,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name),
    FOREIGN KEY (category) REFERENCES recipe_category(name)
);

CREATE TABLE IF NOT EXISTS technology (
    name TEXT PRIMARY KEY NOT NULL,
    group_name TEXT NOT NULL,
    subgroup TEXT NOT NULL,
    "order" TEXT NOT NULL,
    hidden BOOLEAN NOT NULL,
    essential BOOLEAN NOT NULL,
    enabled BOOLEAN NOT NULL,
    visible_when_disabled BOOLEAN NOT NULL,
    upgrade BOOLEAN NOT NULL,
    level INTEGER NOT NULL,
    max_level INTEGER NOT NULL,
    research_unit_count INTEGER NOT NULL,
    research_unit_energy INTEGER NOT NULL,
    research_trigger_type TEXT,
    allows_productivity BOOLEAN NOT NULL,
    research_unit_count_formula TEXT,
    FOREIGN KEY (group_name) REFERENCES item_group(name),
    FOREIGN KEY (subgroup) REFERENCES item_subgroup(name)
);

CREATE TABLE IF NOT EXISTS item_flag (
    item_name TEXT NOT NULL,
    flag TEXT NOT NULL,
    PRIMARY KEY (item_name, flag),
    FOREIGN KEY (item_name) REFERENCES item(name)
);

CREATE TABLE IF NOT EXISTS item_module_effect (
    item_name TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    bonus DECIMAL NOT NULL,
    PRIMARY KEY (item_name, effect_type),
    FOREIGN KEY (item_name) REFERENCES item(name)
);

CREATE TABLE IF NOT EXISTS item_rocket_launch_product (
    item_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    material_type TEXT NOT NULL,
    material_name TEXT NOT NULL,
    amount DECIMAL,
    amount_min DECIMAL,
    amount_max DECIMAL,
    probability DECIMAL,
    temperature DECIMAL,
    catalyst_amount DECIMAL,
    percent_spoiled DECIMAL,
    ignored_by_stats DECIMAL,
    ignored_by_productivity DECIMAL,
    PRIMARY KEY (item_name, sort_index),
    FOREIGN KEY (item_name) REFERENCES item(name)
);

CREATE TABLE IF NOT EXISTS recipe_ingredient (
    recipe_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    material_type TEXT NOT NULL,
    material_name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    minimum_temperature DECIMAL,
    maximum_temperature DECIMAL,
    catalyst_amount DECIMAL,
    PRIMARY KEY (recipe_name, sort_index),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name)
);

CREATE TABLE IF NOT EXISTS recipe_product (
    recipe_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    material_type TEXT NOT NULL,
    material_name TEXT NOT NULL,
    amount DECIMAL,
    amount_min DECIMAL,
    amount_max DECIMAL,
    probability DECIMAL,
    temperature DECIMAL,
    catalyst_amount DECIMAL,
    percent_spoiled DECIMAL,
    ignored_by_stats DECIMAL,
    ignored_by_productivity DECIMAL,
    PRIMARY KEY (recipe_name, sort_index),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name)
);

CREATE TABLE IF NOT EXISTS recipe_allowed_effect (
    recipe_name TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    PRIMARY KEY (recipe_name, effect_type),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name)
);

CREATE TABLE IF NOT EXISTS recipe_allowed_module_category (
    recipe_name TEXT NOT NULL,
    module_category_name TEXT NOT NULL,
    PRIMARY KEY (recipe_name, module_category_name),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name),
    FOREIGN KEY (module_category_name) REFERENCES module_category(name)
);

CREATE TABLE IF NOT EXISTS recipe_additional_category (
    recipe_name TEXT NOT NULL,
    recipe_category_name TEXT NOT NULL,
    PRIMARY KEY (recipe_name, recipe_category_name),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name),
    FOREIGN KEY (recipe_category_name) REFERENCES recipe_category(name)
);

CREATE TABLE IF NOT EXISTS recipe_unlock_result (
    recipe_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    material_type TEXT NOT NULL,
    material_name TEXT NOT NULL,
    PRIMARY KEY (recipe_name, sort_index),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name)
);

CREATE TABLE IF NOT EXISTS recipe_surface_condition (
    recipe_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    property TEXT NOT NULL,
    min_value TEXT NOT NULL,
    max_value TEXT NOT NULL,
    PRIMARY KEY (recipe_name, sort_index),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name)
);

CREATE TABLE IF NOT EXISTS entity_crafting_category (
    entity_name TEXT NOT NULL,
    recipe_category_name TEXT NOT NULL,
    PRIMARY KEY (entity_name, recipe_category_name),
    FOREIGN KEY (entity_name) REFERENCES entity(name),
    FOREIGN KEY (recipe_category_name) REFERENCES recipe_category(name)
);

CREATE TABLE IF NOT EXISTS entity_allowed_effect (
    entity_name TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    PRIMARY KEY (entity_name, effect_type),
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_allowed_module_category (
    entity_name TEXT NOT NULL,
    module_category_name TEXT NOT NULL,
    PRIMARY KEY (entity_name, module_category_name),
    FOREIGN KEY (entity_name) REFERENCES entity(name),
    FOREIGN KEY (module_category_name) REFERENCES module_category(name)
);

CREATE TABLE IF NOT EXISTS entity_resource_category (
    entity_name TEXT NOT NULL,
    resource_category_name TEXT NOT NULL,
    PRIMARY KEY (entity_name, resource_category_name),
    FOREIGN KEY (entity_name) REFERENCES entity(name),
    FOREIGN KEY (resource_category_name) REFERENCES resource_category(name)
);

CREATE TABLE IF NOT EXISTS entity_lab_input (
    entity_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    PRIMARY KEY (entity_name, item_name),
    FOREIGN KEY (entity_name) REFERENCES entity(name),
    FOREIGN KEY (item_name) REFERENCES item(name)
);

CREATE TABLE IF NOT EXISTS entity_beacon_profile (
    entity_name TEXT NOT NULL,
    quality_index INTEGER NOT NULL,
    effectivity DECIMAL NOT NULL,
    PRIMARY KEY (entity_name, quality_index),
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_item_to_place (
    entity_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (entity_name, sort_index),
    FOREIGN KEY (entity_name) REFERENCES entity(name),
    FOREIGN KEY (item_name) REFERENCES item(name)
);

CREATE TABLE IF NOT EXISTS entity_surface_condition (
    entity_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    property TEXT NOT NULL,
    min_value TEXT NOT NULL,
    max_value TEXT NOT NULL,
    PRIMARY KEY (entity_name, sort_index),
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_effect_receiver (
    entity_name TEXT PRIMARY KEY NOT NULL,
    base_effect JSON,
    uses_module_effects BOOLEAN NOT NULL,
    uses_beacon_effects BOOLEAN NOT NULL,
    uses_surface_effects BOOLEAN NOT NULL,
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_energy_source_type (
    entity_name TEXT NOT NULL,
    energy_source_type TEXT NOT NULL,
    PRIMARY KEY (entity_name, energy_source_type),
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_burner_energy_source (
    entity_name TEXT PRIMARY KEY NOT NULL,
    effectivity DECIMAL NOT NULL,
    fuel_inventory_size INTEGER NOT NULL,
    burnt_inventory_size INTEGER NOT NULL,
    initial_fuel TEXT,
    initial_fuel_percent DECIMAL,
    emissions_per_joule JSON,
    render_no_network_icon BOOLEAN NOT NULL,
    render_no_power_icon BOOLEAN NOT NULL,
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_burner_fuel_category (
    entity_name TEXT NOT NULL,
    fuel_category_name TEXT NOT NULL,
    PRIMARY KEY (entity_name, fuel_category_name),
    FOREIGN KEY (entity_name) REFERENCES entity(name),
    FOREIGN KEY (fuel_category_name) REFERENCES fuel_category(name)
);

CREATE TABLE IF NOT EXISTS entity_electric_energy_source (
    entity_name TEXT PRIMARY KEY NOT NULL,
    buffer_capacity DECIMAL NOT NULL,
    usage_priority TEXT NOT NULL,
    drain DECIMAL NOT NULL,
    input_flow_limit TEXT,
    output_flow_limit TEXT,
    emissions_per_joule JSON,
    render_no_network_icon BOOLEAN NOT NULL,
    render_no_power_icon BOOLEAN NOT NULL,
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_fluid_energy_source (
    entity_name TEXT PRIMARY KEY NOT NULL,
    effectivity DECIMAL NOT NULL,
    burns_fluid BOOLEAN NOT NULL,
    scale_fluid_usage BOOLEAN NOT NULL,
    destroy_non_fuel_fluid BOOLEAN NOT NULL,
    fluid_usage_per_tick DECIMAL NOT NULL,
    maximum_temperature DECIMAL NOT NULL,
    fluid_box JSON,
    emissions_per_joule JSON,
    render_no_network_icon BOOLEAN NOT NULL,
    render_no_power_icon BOOLEAN NOT NULL,
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_heat_energy_source (
    entity_name TEXT PRIMARY KEY NOT NULL,
    max_temperature DECIMAL NOT NULL,
    default_temperature DECIMAL NOT NULL,
    specific_heat DECIMAL NOT NULL,
    max_transfer DECIMAL NOT NULL,
    min_temperature_gradient DECIMAL NOT NULL,
    min_working_temperature DECIMAL NOT NULL,
    minimum_glow_temperature DECIMAL NOT NULL,
    heat_buffer JSON,
    emissions_per_joule JSON,
    render_no_network_icon BOOLEAN NOT NULL,
    render_no_power_icon BOOLEAN NOT NULL,
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_void_energy_source (
    entity_name TEXT PRIMARY KEY NOT NULL,
    emissions_per_joule JSON,
    render_no_network_icon BOOLEAN NOT NULL,
    render_no_power_icon BOOLEAN NOT NULL,
    FOREIGN KEY (entity_name) REFERENCES entity(name)
);

CREATE TABLE IF NOT EXISTS entity_fluidbox_prototype (
    entity_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    production_type TEXT NOT NULL,
    filter_fluid_name TEXT,
    minimum_temperature DECIMAL,
    maximum_temperature DECIMAL,
    base_area DECIMAL NOT NULL,
    base_level DECIMAL NOT NULL,
    volume DECIMAL,
    PRIMARY KEY (entity_name, sort_index),
    FOREIGN KEY (entity_name) REFERENCES entity(name),
    FOREIGN KEY (filter_fluid_name) REFERENCES fluid(name)
);

CREATE TABLE IF NOT EXISTS technology_research_unit_ingredient (
    technology_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    PRIMARY KEY (technology_name, sort_index),
    FOREIGN KEY (technology_name) REFERENCES technology(name),
    FOREIGN KEY (item_name) REFERENCES item(name)
);

CREATE TABLE IF NOT EXISTS technology_prerequisite (
    technology_name TEXT NOT NULL,
    prerequisite_name TEXT NOT NULL,
    PRIMARY KEY (technology_name, prerequisite_name),
    FOREIGN KEY (technology_name) REFERENCES technology(name),
    FOREIGN KEY (prerequisite_name) REFERENCES technology(name)
);

CREATE TABLE IF NOT EXISTS technology_successor (
    technology_name TEXT NOT NULL,
    successor_name TEXT NOT NULL,
    PRIMARY KEY (technology_name, successor_name),
    FOREIGN KEY (technology_name) REFERENCES technology(name),
    FOREIGN KEY (successor_name) REFERENCES technology(name)
);

CREATE TABLE IF NOT EXISTS technology_effect (
    technology_name TEXT NOT NULL,
    sort_index INTEGER NOT NULL,
    effect_type TEXT NOT NULL,
    modifier_boolean BOOLEAN,
    modifier_integer INTEGER,
    modifier_decimal DECIMAL,
    recipe_name TEXT,
    space_location_name TEXT,
    PRIMARY KEY (technology_name, sort_index),
    FOREIGN KEY (technology_name) REFERENCES technology(name),
    FOREIGN KEY (recipe_name) REFERENCES recipe(name),
    FOREIGN KEY (space_location_name) REFERENCES space_location(name)
);

CREATE TABLE IF NOT EXISTS space_connection (
    name TEXT PRIMARY KEY NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    length INTEGER NOT NULL,
    FOREIGN KEY (from_location) REFERENCES space_location(name),
    FOREIGN KEY (to_location) REFERENCES space_location(name)
);

CREATE TABLE IF NOT EXISTS equipment_allowed_category (
    equipment_name TEXT NOT NULL,
    category_name TEXT NOT NULL,
    PRIMARY KEY (equipment_name, category_name),
    FOREIGN KEY (equipment_name) REFERENCES equipment(name),
    FOREIGN KEY (category_name) REFERENCES equipment_category(name)
);

CREATE TABLE IF NOT EXISTS equipment_grid_allowed_category (
    equipment_grid_name TEXT NOT NULL,
    category_name TEXT NOT NULL,
    PRIMARY KEY (equipment_grid_name, category_name),
    FOREIGN KEY (equipment_grid_name) REFERENCES equipment_grid(name),
    FOREIGN KEY (category_name) REFERENCES equipment_category(name)
);

CREATE INDEX IF NOT EXISTS idx_item_place_result ON item(place_result);
CREATE INDEX IF NOT EXISTS idx_item_place_as_equipment_result ON item(place_as_equipment_result);
CREATE INDEX IF NOT EXISTS idx_recipe_category ON recipe(category);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_material_name ON recipe_ingredient(material_name);
CREATE INDEX IF NOT EXISTS idx_recipe_product_material_name ON recipe_product(material_name);
CREATE INDEX IF NOT EXISTS idx_entity_crafting_category_recipe_category_name ON entity_crafting_category(recipe_category_name);
CREATE INDEX IF NOT EXISTS idx_entity_lab_input_item_name ON entity_lab_input(item_name);
CREATE INDEX IF NOT EXISTS idx_entity_burner_fuel_category_name ON entity_burner_fuel_category(fuel_category_name);
CREATE INDEX IF NOT EXISTS idx_technology_prerequisite_name ON technology_prerequisite(prerequisite_name);
CREATE INDEX IF NOT EXISTS idx_technology_effect_recipe_name ON technology_effect(recipe_name);
CREATE INDEX IF NOT EXISTS idx_technology_effect_space_location_name ON technology_effect(space_location_name);
CREATE INDEX IF NOT EXISTS idx_equipment_allowed_category_name ON equipment_allowed_category(category_name);
CREATE INDEX IF NOT EXISTS idx_equipment_grid_allowed_category_name ON equipment_grid_allowed_category(category_name);
"#;

const DOWN_SQL: &str = r#"
DROP TABLE IF EXISTS equipment_grid_allowed_category;
DROP TABLE IF EXISTS equipment_allowed_category;
DROP TABLE IF EXISTS space_connection;
DROP TABLE IF EXISTS technology_effect;
DROP TABLE IF EXISTS technology_successor;
DROP TABLE IF EXISTS technology_prerequisite;
DROP TABLE IF EXISTS technology_research_unit_ingredient;
DROP TABLE IF EXISTS entity_fluidbox_prototype;
DROP TABLE IF EXISTS entity_void_energy_source;
DROP TABLE IF EXISTS entity_heat_energy_source;
DROP TABLE IF EXISTS entity_fluid_energy_source;
DROP TABLE IF EXISTS entity_electric_energy_source;
DROP TABLE IF EXISTS entity_burner_fuel_category;
DROP TABLE IF EXISTS entity_burner_energy_source;
DROP TABLE IF EXISTS entity_energy_source_type;
DROP TABLE IF EXISTS entity_effect_receiver;
DROP TABLE IF EXISTS entity_surface_condition;
DROP TABLE IF EXISTS entity_item_to_place;
DROP TABLE IF EXISTS entity_beacon_profile;
DROP TABLE IF EXISTS entity_lab_input;
DROP TABLE IF EXISTS entity_resource_category;
DROP TABLE IF EXISTS entity_allowed_module_category;
DROP TABLE IF EXISTS entity_allowed_effect;
DROP TABLE IF EXISTS entity_crafting_category;
DROP TABLE IF EXISTS recipe_surface_condition;
DROP TABLE IF EXISTS recipe_unlock_result;
DROP TABLE IF EXISTS recipe_additional_category;
DROP TABLE IF EXISTS recipe_allowed_module_category;
DROP TABLE IF EXISTS recipe_allowed_effect;
DROP TABLE IF EXISTS recipe_product;
DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS item_rocket_launch_product;
DROP TABLE IF EXISTS item_module_effect;
DROP TABLE IF EXISTS item_flag;
DROP TABLE IF EXISTS technology;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS fluid;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS entity;
DROP TABLE IF EXISTS equipment_grid;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS quality;
DROP TABLE IF EXISTS space_location;
DROP TABLE IF EXISTS item_subgroup;
DROP TABLE IF EXISTS item_group;
DROP TABLE IF EXISTS equipment_category;
DROP TABLE IF EXISTS module_category;
DROP TABLE IF EXISTS resource_category;
DROP TABLE IF EXISTS fuel_category;
DROP TABLE IF EXISTS recipe_category;
DROP TABLE IF EXISTS active_mod;
DROP TABLE IF EXISTS game;
"#;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.get_connection().execute_unprepared(UP_SQL).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.get_connection().execute_unprepared(DOWN_SQL).await?;
        Ok(())
    }
}
