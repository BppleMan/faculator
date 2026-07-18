use crate::game_data::{
    concept::{ModuleEffect as SourceModuleEffect, Product as SourceProduct},
    fluid::Fluid as SourceFluid,
    item::Item as SourceItem,
};
use color_eyre::eyre::{Result, eyre};
use faculator_core::{
    category::{FuelCategory, ModuleCategory},
    concept::{Color as CoreColor, MaterialId, MaterialType, ModuleEffect, ModuleEffectModifier, Number, Product},
    entity::EntityId,
    material::{
        Fluid as CoreFluid, FluidColorSet, FluidFuelCapability, FluidId, FluidThermodynamics, FuelCapability,
        Item as CoreItem, ItemCapability, ItemFlag, ItemFlagSet, ItemId, ItemType, ModuleCapability,
        PlacementCapability, TransformationCapability,
    },
};

pub fn item_to_core(item: SourceItem) -> Result<CoreItem> {
    let item_type = item_type_to_core(item.name.as_str(), item.item_type.as_str())?;
    let flags = item_flags_to_core(item.name.as_str(), item.flags.into_vec())?;

    let fuel = if item.fuel_value > 0 || item.fuel_category.is_some() {
        Some(FuelCapability {
            fuel_value: item.fuel_value,
            fuel_acceleration_multiplier: item.fuel_acceleration_multiplier,
            fuel_top_speed_multiplier: item.fuel_top_speed_multiplier,
            fuel_emissions_multiplier: item.fuel_emissions_multiplier,
            fuel_category: item
                .fuel_category
                .as_deref()
                .map(|raw_fuel_category| fuel_category_to_core(item.name.as_str(), raw_fuel_category))
                .transpose()?,
        })
    } else {
        None
    };

    let module = if item.module_effects.is_some() || item.category.is_some() || item.tier.is_some() {
        Some(ModuleCapability {
            effects: item.module_effects.map(module_effect_to_core),
            category: item
                .category
                .as_deref()
                .map(|raw_module_category| module_category_to_core(item.name.as_str(), raw_module_category))
                .transpose()?,
            tier: item.tier,
        })
    } else {
        None
    };

    let placement =
        if item.place_result.is_some() || item.plant_result.is_some() || item.place_as_equipment_result.is_some() {
            Some(PlacementCapability {
                place_result: item.place_result.map(EntityId::from),
                plant_result: item.plant_result.map(EntityId::from),
                place_as_equipment_result: item.place_as_equipment_result,
            })
        } else {
            None
        };

    let transformation =
        if item.rocket_launch_products.is_some() || item.spoil_result.is_some() || item.burnt_result.is_some() {
            Some(TransformationCapability {
                rocket_launch_products: item
                    .rocket_launch_products
                    .map(|products| {
                        products
                            .into_iter()
                            .map(|product| product_to_core(item.name.as_str(), product))
                            .collect::<Result<Vec<_>>>()
                    })
                    .transpose()?,
                spoil_result: item.spoil_result.map(ItemId::from),
                burnt_result: item.burnt_result.map(ItemId::from),
            })
        } else {
            None
        };

    Ok(CoreItem {
        name: ItemId::from(item.name),
        item_type,
        order: item.order,
        hidden: item.hidden,
        stack_size: item.stack_size,
        weight: item.weight,
        default_import_location: item.default_import_location,
        capability: ItemCapability {
            fuel,
            module,
            placement,
            transformation,
        },
        flag_set: flags,
    })
}

pub fn fluid_to_core(fluid: SourceFluid) -> Result<CoreFluid> {
    let fluid_name = fluid.name.clone();
    let fuel = if fluid.fuel_value > 0 {
        Some(FluidFuelCapability {
            fuel_value: fluid.fuel_value,
            emissions_multiplier: fluid.emissions_multiplier,
        })
    } else {
        None
    };

    Ok(CoreFluid {
        name: FluidId::from(fluid.name),
        order: fluid.order,
        hidden: fluid.hidden,
        thermodynamics: FluidThermodynamics {
            default_temperature: fluid.default_temperature,
            max_temperature: fluid.max_temperature,
            heat_capacity: fluid.heat_capacity,
            gas_temperature: exported_number_to_core(
                &format!("game_data.fluids[{fluid_name:?}].gas_temperature"),
                fluid.gas_temperature,
            )?,
        },
        fuel,
        color: FluidColorSet {
            base: color_to_core(fluid.base_color),
            flow: color_to_core(fluid.flow_color),
        },
    })
}

pub fn item_type_to_core(item_name: &str, raw_item_type: &str) -> Result<ItemType> {
    ItemType::try_from(raw_item_type).map_err(|_| {
        eyre!(
            "failed to convert game_data.items[{item_name:?}].type = {raw_item_type:?} into faculator_core::material::ItemType; supported values: {}",
            ItemType::variants().join(", ")
        )
    })
}

pub fn item_flags_to_core(item_name: &str, raw_flags: Vec<String>) -> Result<ItemFlagSet> {
    raw_flags
        .into_iter()
        .map(|raw_flag| {
            ItemFlag::try_from(raw_flag.as_str()).map_err(|_| {
                eyre!(
                    "failed to convert game_data.items[{item_name:?}].flags entry {raw_flag:?} into faculator_core::material::ItemFlag; supported values: {}",
                    ItemFlag::variants().join(", ")
                )
            })
        })
        .collect()
}

pub fn fuel_category_to_core(item_name: &str, raw_fuel_category: &str) -> Result<FuelCategory> {
    FuelCategory::try_from(raw_fuel_category).map_err(|_| {
        eyre!(
            "failed to convert game_data.items[{item_name:?}].fuel_category = {raw_fuel_category:?} into faculator_core::category::FuelCategory; supported values: {}",
            FuelCategory::variants().join(", ")
        )
    })
}

pub fn module_category_to_core(item_name: &str, raw_module_category: &str) -> Result<ModuleCategory> {
    ModuleCategory::try_from(raw_module_category).map_err(|_| {
        eyre!(
            "failed to convert game_data.items[{item_name:?}].category = {raw_module_category:?} into faculator_core::category::ModuleCategory; supported values: {}",
            ModuleCategory::variants().join(", ")
        )
    })
}

pub fn material_type_to_core(path: &str, raw_material_type: &str) -> Result<MaterialType> {
    MaterialType::try_from(raw_material_type).map_err(|_| {
        eyre!(
            "failed to convert {path}.type = {raw_material_type:?} into faculator_core::concept::MaterialType; supported values: {}",
            MaterialType::variants().join(", ")
        )
    })
}

fn module_effect_to_core(effect: SourceModuleEffect) -> ModuleEffect {
    ModuleEffect {
        consumption: effect.consumption.map(effect_value_to_core),
        speed: effect.speed.map(effect_value_to_core),
        productivity: effect.productivity.map(effect_value_to_core),
        pollution: effect.pollution.map(effect_value_to_core),
        quality: effect.quality.map(effect_value_to_core),
    }
}

fn effect_value_to_core(value: rust_decimal::Decimal) -> ModuleEffectModifier {
    ModuleEffectModifier { bonus: value }
}

fn color_to_core(color: crate::game_data::concept::Color) -> CoreColor {
    CoreColor {
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a,
    }
}

fn exported_number_to_core(path: &str, value: crate::game_data::ExportedNumber) -> Result<Number> {
    if value.is_sentinel() {
        return Ok(Number::Sentinel);
    }

    value.as_decimal().map(Number::Decimal).ok_or_else(|| {
        eyre!(
            "failed to convert {path} = {:?} into faculator_core::concept::Number; expected decimal or known numeric sentinel",
            value.as_str()
        )
    })
}

fn product_to_core(item_name: &str, product: SourceProduct) -> Result<Product> {
    let product_name = product.name.clone();

    Ok(Product {
        material: material_id_to_core(
            &format!("game_data.items[{item_name:?}].rocket_launch_products[{product_name:?}]"),
            product.material_type.as_str(),
            product.name,
        )?,
        amount: product.amount,
        amount_min: product.amount_min,
        amount_max: product.amount_max,
        probability: product.probability,
        temperature: product.temperature,
        catalyst_amount: product.catalyst_amount,
        percent_spoiled: product.percent_spoiled,
        ignored_by_stats: product.ignored_by_stats,
        ignored_by_productivity: product.ignored_by_productivity,
    })
}

fn material_id_to_core(path: &str, raw_material_type: &str, raw_name: String) -> Result<MaterialId> {
    Ok(match material_type_to_core(path, raw_material_type)? {
        MaterialType::Item => MaterialId::Item(ItemId::from(raw_name)),
        MaterialType::Fluid => MaterialId::Fluid(FluidId::from(raw_name)),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game_data::{ArrayOrEmptyObject, EmptyObject, ExportedNumber, concept::Color, fluid::Fluid, item::Item};
    use rust_decimal::Decimal;

    fn sample_item(raw_item_type: &str) -> Item {
        Item {
            name: "sample-item".to_owned(),
            item_type: raw_item_type.to_owned(),
            group: "logistics".to_owned(),
            subgroup: "belt".to_owned(),
            order: "a".to_owned(),
            hidden: false,
            stack_size: 100,
            weight: Decimal::ZERO,
            default_import_location: "nauvis".to_owned(),
            fuel_value: 0,
            fuel_acceleration_multiplier: Decimal::ZERO,
            fuel_top_speed_multiplier: Decimal::ZERO,
            fuel_emissions_multiplier: 0,
            flags: ArrayOrEmptyObject::EmptyObject(EmptyObject::default()),
            fuel_category: None,
            module_effects: None,
            category: None,
            tier: None,
            place_result: None,
            plant_result: None,
            rocket_launch_products: None,
            place_as_equipment_result: None,
            spoil_result: None,
            send_to_orbit_mode: None,
            burnt_result: None,
        }
    }

    fn sample_fluid(gas_temperature: ExportedNumber) -> Fluid {
        Fluid {
            name: "sample-fluid".to_owned(),
            group: "fluids".to_owned(),
            subgroup: "fluid".to_owned(),
            order: "a".to_owned(),
            hidden: false,
            default_temperature: Decimal::new(25, 0),
            max_temperature: Decimal::new(100, 0),
            heat_capacity: Decimal::new(2, 0),
            fuel_value: 100,
            emissions_multiplier: Decimal::new(5, 1),
            gas_temperature,
            base_color: Color {
                r: Decimal::ONE,
                g: Decimal::ZERO,
                b: Decimal::ZERO,
                a: Decimal::ONE,
            },
            flow_color: Color {
                r: Decimal::ZERO,
                g: Decimal::ONE,
                b: Decimal::ZERO,
                a: Decimal::ONE,
            },
        }
    }

    #[test]
    fn item_to_core_accepts_supported_item_type() {
        let core_item = item_to_core(sample_item("item")).expect("supported item type should convert");

        assert_eq!(core_item.name, ItemId::from("sample-item"));
        assert_eq!(core_item.item_type, ItemType::Item);
        assert!(core_item.flag_set.is_empty());
    }

    #[test]
    fn item_to_core_accepts_supported_item_flags() {
        let mut item = sample_item("item");
        item.flags = ArrayOrEmptyObject::Array(vec!["always-show".to_owned(), "spawnable".to_owned()]);

        let core_item = item_to_core(item).expect("supported item flags should convert");

        assert!(core_item.flag_set.has_flag(ItemFlag::AlwaysShow));
        assert!(core_item.flag_set.has_flag(ItemFlag::Spawnable));
        assert_eq!(core_item.flag_set.len(), 2);
    }

    #[test]
    fn item_to_core_accepts_supported_item_category_and_material_type() {
        let mut item = sample_item("item");
        item.fuel_value = 1;
        item.fuel_category = Some("chemical".to_owned());
        item.category = Some("speed".to_owned());
        item.place_result = Some("assembling-machine-1".to_owned());
        item.plant_result = Some("tree-plant".to_owned());
        item.spoil_result = Some("spoilage".to_owned());
        item.burnt_result = Some("ash".to_owned());
        item.rocket_launch_products = Some(vec![SourceProduct {
            material_type: "item".to_owned(),
            name: "iron-plate".to_owned(),
            amount: Some(Decimal::ONE),
            amount_min: None,
            amount_max: None,
            probability: None,
            temperature: None,
            catalyst_amount: None,
            percent_spoiled: None,
            ignored_by_stats: None,
            ignored_by_productivity: None,
        }]);

        let core_item = item_to_core(item).expect("supported item categories and material types should convert");

        assert_eq!(
            core_item.capability.fuel.as_ref().and_then(|fuel| fuel.fuel_category),
            Some(FuelCategory::Chemical)
        );
        assert_eq!(
            core_item.capability.module.as_ref().and_then(|module| module.category),
            Some(ModuleCategory::Speed)
        );
        assert_eq!(
            core_item
                .capability
                .placement
                .as_ref()
                .and_then(|placement| placement.place_result.clone()),
            Some(EntityId::from("assembling-machine-1"))
        );
        assert_eq!(
            core_item
                .capability
                .placement
                .as_ref()
                .and_then(|placement| placement.plant_result.clone()),
            Some(EntityId::from("tree-plant"))
        );
        assert_eq!(
            core_item
                .capability
                .transformation
                .as_ref()
                .and_then(|transformation| transformation.spoil_result.clone()),
            Some(ItemId::from("spoilage"))
        );
        assert_eq!(
            core_item
                .capability
                .transformation
                .as_ref()
                .and_then(|transformation| transformation.burnt_result.clone()),
            Some(ItemId::from("ash"))
        );
        assert_eq!(
            core_item
                .capability
                .transformation
                .as_ref()
                .and_then(|transformation| transformation.rocket_launch_products.as_ref())
                .and_then(|products| products.first())
                .map(|product| product.material.clone()),
            Some(MaterialId::Item(ItemId::from("iron-plate")))
        );
    }

    #[test]
    fn item_to_core_reports_unknown_item_type_clearly() {
        let error =
            item_to_core(sample_item("future-item-type")).expect_err("unknown item type should fail during transform");
        let message = format!("{error}");

        assert!(message.contains("game_data.items[\"sample-item\"].type"));
        assert!(message.contains("future-item-type"));
        assert!(message.contains("supported values"));
    }

    #[test]
    fn item_to_core_reports_unknown_item_flag_clearly() {
        let mut item = sample_item("item");
        item.flags = ArrayOrEmptyObject::Array(vec!["future-flag".to_owned()]);

        let error = item_to_core(item).expect_err("unknown item flag should fail during transform");
        let message = format!("{error}");

        assert!(message.contains("game_data.items[\"sample-item\"].flags entry"));
        assert!(message.contains("future-flag"));
        assert!(message.contains("supported values"));
    }

    #[test]
    fn item_to_core_reports_unknown_fuel_category_clearly() {
        let mut item = sample_item("item");
        item.fuel_value = 1;
        item.fuel_category = Some("future-fuel-category".to_owned());

        let error = item_to_core(item).expect_err("unknown fuel category should fail during transform");
        let message = format!("{error}");

        assert!(message.contains("game_data.items[\"sample-item\"].fuel_category"));
        assert!(message.contains("future-fuel-category"));
        assert!(message.contains("supported values"));
    }

    #[test]
    fn fluid_to_core_accepts_decimal_gas_temperature() {
        let core_fluid =
            fluid_to_core(sample_fluid(ExportedNumber::from("80"))).expect("decimal gas temperature should convert");

        assert_eq!(core_fluid.name, FluidId::from("sample-fluid"));
        assert_eq!(
            core_fluid.thermodynamics.gas_temperature,
            Number::Decimal(Decimal::new(80, 0))
        );
        assert!(core_fluid.is_fuel());
    }

    #[test]
    fn fluid_to_core_accepts_sentinel_gas_temperature() {
        let core_fluid = fluid_to_core(sample_fluid(ExportedNumber::from(ExportedNumber::F32_MAX_TEXT)))
            .expect("sentinel gas temperature should convert");

        assert_eq!(core_fluid.thermodynamics.gas_temperature, Number::Sentinel);
    }
}
