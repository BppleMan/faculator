import { inject, Service } from "@angular/core";

import { CalculationGateway } from "../../core/faculator-api/contracts/calculation-gateway";
import { CalculationStatus } from "../../core/faculator-api/models/calculation-status";
import {
    BalanceDto,
    BomNodeDto,
    CalculationResultDto,
    GameCatalogDto,
    GatewayResultDto,
    MachineDto,
    MatrixRowDto,
    MaterialDto,
    ProcessConfigurationDto,
    ProcessDto,
    ProductionLineDto,
    RecipeDto
} from "../../core/faculator-api/models/faculator-dtos";
import { LocalGameCatalog } from "./local-game-catalog";

class ExpansionState {
    public readonly processes: ProcessDto[] = [];
    public readonly inputs = new Map<string, MaterialDto>();
}

@Service()
export class LocalCalculation implements CalculationGateway {
    private readonly catalogAdapter = inject(LocalGameCatalog);
    private readonly naturalBoundaryMaterials = new Set([
        "item:coal", "item:iron-ore", "item:copper-ore", "item:stone", "item:uranium-ore", "item:wood",
        "item:calcite", "item:tungsten-ore", "item:scrap", "item:holmium-ore",
        "item:metallic-asteroid-chunk", "item:carbonic-asteroid-chunk",
        "item:oxide-asteroid-chunk", "item:promethium-asteroid-chunk",
        "fluid:crude-oil", "fluid:water", "fluid:steam", "fluid:lava", "fluid:fluorine", "fluid:lithium-brine"
    ]);

    public async calculate(line: ProductionLineDto): Promise<GatewayResultDto<CalculationResultDto>> {
        const catalog = this.catalogAdapter.catalog;
        if (!catalog) {
            return GatewayResultDto.failure("catalog-not-ready", "Game catalog must be loaded before calculation.");
        }
        if (line.appliedTargets.length === 0) {
            return GatewayResultDto.success(new CalculationResultDto(
                line.id, CalculationStatus.Unconfigured, "unconfigured", [], [], [], [], []
            ));
        }

        const state = new ExpansionState();
        const roots = line.appliedTargets.map((target, index) => this.expand(
            catalog,
            line,
            new MaterialDto(target.type, target.name, target.minimum),
            `target-${index}`,
            new Set(),
            state
        ));
        const balances = line.appliedTargets.map((target) => {
            const output = state.processes.reduce((sum, process) => sum + process.recipe.products
                .filter((product) => product.key === target.key)
                .reduce((productSum, product) => productSum + product.amount * process.cyclesPerMinute, 0), 0);
            const gap = Math.max(0, target.minimum - output);
            return new BalanceDto(target, target.minimum, output, gap, Math.max(0, output - target.minimum), gap <= 0.01);
        });
        const status = balances.every((entry) => entry.met) ? CalculationStatus.Feasible : CalculationStatus.Infeasible;
        const matrixMaterials = new Map<string, MaterialDto>();
        state.processes.forEach((process) => {
            process.recipe.ingredients.forEach((material) => matrixMaterials.set(material.key, material));
            process.recipe.products.forEach((material) => matrixMaterials.set(material.key, material));
        });
        const matrix = [...matrixMaterials.values()].map((material) => new MatrixRowDto(material, state.processes.map((process) =>
            process.recipe.products.filter((product) => product.key === material.key).reduce((sum, product) => sum + product.amount, 0)
            - process.recipe.ingredients.filter((ingredient) => ingredient.key === material.key).reduce((sum, ingredient) => sum + ingredient.amount, 0)
        )));
        return GatewayResultDto.success(new CalculationResultDto(
            line.id, status, "bom-expansion", roots, state.processes, balances, [...state.inputs.values()], matrix
        ));
    }

    private expand(
        catalog: GameCatalogDto,
        line: ProductionLineDto,
        material: MaterialDto,
        path: string,
        ancestors: ReadonlySet<string>,
        state: ExpansionState
    ): BomNodeDto {
        const choiceKey = `instance:${path}`;
        const candidates = this.producers(catalog, material);
        const selectedName = line.recipeChoices.get(choiceKey) ?? line.recipeChoices.get(material.key);
        const recipe = candidates.find((candidate) => candidate.name === selectedName) ?? candidates[0] ?? null;
        const boundary = this.isBoundary(catalog, material) || ancestors.has(material.key) || recipe === null;
        if (boundary || !recipe) {
            const current = state.inputs.get(material.key);
            state.inputs.set(material.key, new MaterialDto(material.type, material.name, (current?.amount ?? 0) + material.amount));
            return new BomNodeDto(`bom:${path}`, path, material, material.amount, true, null, []);
        }

        const product = recipe.products.find((candidate) => candidate.key === material.key);
        const cycles = material.amount / Math.max(product?.amount ?? 0, 0.000001);
        const processId = `${recipe.name}::${path}`;
        const machines = catalog.machines.filter((machine) => machine.craftingCategories.includes(recipe.category));
        const configuration = line.processConfigurations.get(choiceKey) ?? new ProcessConfigurationDto();
        const machine = this.chooseMachine(machines, configuration.machineName);
        const machineEffects = configuration.machineModuleSlots.flatMap((slot) => slot ? [this.moduleEffect(catalog, slot.moduleName, slot.qualityName)] : []);
        const beaconEffects = configuration.beaconModuleSlots.flatMap((slot) => slot ? [this.moduleEffect(catalog, slot.moduleName, slot.qualityName)] : []);
        const speedBonus = machineEffects.reduce((sum, effect) => sum + effect.speed, 0)
            + beaconEffects.reduce((sum, effect) => sum + effect.speed, 0) * configuration.beaconCount * 0.5;
        const productivityBonus = Math.min(recipe.maximumProductivity || Number.POSITIVE_INFINITY, machineEffects.reduce((sum, effect) => sum + effect.productivity, 0));
        const qualityBonus = machineEffects.reduce((sum, effect) => sum + effect.quality, 0)
            + beaconEffects.reduce((sum, effect) => sum + effect.quality, 0) * configuration.beaconCount * 0.5;
        const speedMultiplier = Math.max(0.2, 1 + speedBonus);
        const effectiveSpeed = machine ? machine.craftingSpeed * speedMultiplier : 0;
        const productiveCycles = cycles / Math.max(1 + productivityBonus, 0.000001);
        const capacity = machine ? (60 / recipe.energy) * effectiveSpeed : 0;
        const exactMachines = capacity > 0 ? productiveCycles / capacity : 0;
        const fulfills = new MaterialDto(material.type, material.name, material.amount);
        state.processes.push(new ProcessDto(
            processId,
            choiceKey,
            recipe,
            fulfills,
            cycles,
            machine,
            machines,
            machine?.moduleSlots ?? 0,
            2,
            exactMachines,
            exactMachines > 0 ? Math.ceil(exactMachines) : 0,
            effectiveSpeed,
            productivityBonus,
            qualityBonus,
            new ProcessConfigurationDto(machine?.name ?? "", configuration.machineModuleSlots, configuration.beaconCount, configuration.beaconModuleSlots),
            speedMultiplier,
            path,
            path.split(".").length - 1
        ));

        const nextAncestors = new Set(ancestors);
        nextAncestors.add(material.key);
        const children = recipe.ingredients.map((ingredient, index) => this.expand(
            catalog,
            line,
            new MaterialDto(ingredient.type, ingredient.name, ingredient.amount * cycles),
            `${path}.${index}`,
            nextAncestors,
            state
        ));
        return new BomNodeDto(`bom:${path}`, path, material, material.amount, false, processId, children);
    }

    private moduleEffect(catalog: GameCatalogDto, moduleName: string, qualityName: string): { speed: number; productivity: number; quality: number } {
        const module = catalog.modules.find((candidate) => candidate.name === moduleName);
        const quality = catalog.qualities.find((candidate) => candidate.name === qualityName);
        const multiplier = 1 + (quality?.level ?? 0) * 0.3;
        return { speed: (module?.speed ?? 0) * multiplier, productivity: (module?.productivity ?? 0) * multiplier, quality: (module?.quality ?? 0) * multiplier };
    }

    private producers(catalog: GameCatalogDto, material: MaterialDto): ReadonlyArray<RecipeDto> {
        return catalog.recipes
            .filter((recipe) => !recipe.hidden && recipe.ingredients.length > 0 && recipe.products.some((product) => product.key === material.key))
            .sort((left, right) => this.preference(left, material) - this.preference(right, material)
                || left.order.localeCompare(right.order, "en")
                || left.name.localeCompare(right.name, "en"));
    }

    private preference(recipe: RecipeDto, material: MaterialDto): number {
        let score = 0;
        if (recipe.name === material.name) score -= 1000;
        if (recipe.mainProduct?.key === material.key) score -= 600;
        if (recipe.name.startsWith("empty-") && recipe.name.endsWith("-barrel")) score += 1200;
        if (recipe.name.includes("recycling") || recipe.category.includes("recycling")) score += 900;
        const product = recipe.products.find((candidate) => candidate.key === material.key);
        if ((product?.ignoredByStats ?? 0) >= (product?.amount ?? Number.POSITIVE_INFINITY)) score += 500;
        if (recipe.ingredients.some((ingredient) => ingredient.key === material.key)) score += 400;
        return score;
    }

    private chooseMachine(machines: ReadonlyArray<MachineDto>, configuredName: string): MachineDto | null {
        return machines.find((machine) => machine.name === configuredName)
            ?? machines.find((machine) => machine.name === "chemical-plant")
            ?? machines[0]
            ?? null;
    }

    private isBoundary(catalog: GameCatalogDto, material: MaterialDto): boolean {
        const prototype = catalog.materials.find((candidate) => candidate.key === material.key);
        return prototype?.subgroup === "raw-resource" || this.naturalBoundaryMaterials.has(material.key);
    }
}
