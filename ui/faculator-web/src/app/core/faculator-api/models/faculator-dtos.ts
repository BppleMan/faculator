import { CalculationStatus } from "./calculation-status";

export class LocalizedTextDto {
    public constructor(public readonly chinese: string, public readonly english: string) {}

    public value(locale: string): string {
        return locale === "en" ? this.english : this.chinese;
    }
}

export class MaterialDto {
    public constructor(public readonly type: string, public readonly name: string, public readonly amount = 0, public readonly ignoredByStats = 0) {}

    public get key(): string {
        return `${this.type}:${this.name}`;
    }
}

export class TargetDto extends MaterialDto {
    public constructor(type: string, name: string, public readonly minimum: number) {
        super(type, name, minimum);
    }
}

export class ModuleSelectionDto {
    public constructor(public readonly moduleName: string, public readonly qualityName: string) {}
}

export class ProcessConfigurationDto {
    public constructor(
        public readonly machineName = "",
        public readonly machineModuleSlots: ReadonlyArray<ModuleSelectionDto | null> = [],
        public readonly beaconCount = 0,
        public readonly beaconModuleSlots: ReadonlyArray<ModuleSelectionDto | null> = []
    ) {}
}

export class ProductionLineDto {
    public constructor(
        public readonly id: string,
        public readonly title: LocalizedTextDto,
        public readonly targets: ReadonlyArray<TargetDto>,
        public readonly appliedTargets: ReadonlyArray<TargetDto>,
        public readonly recipeChoices: ReadonlyMap<string, string>,
        public readonly processConfigurations: ReadonlyMap<string, ProcessConfigurationDto>,
        public readonly exportedOutputs: ReadonlyArray<string>,
        public readonly dirty: boolean
    ) {}
}

export class ProductionBlockDto {
    public constructor(
        public readonly id: string,
        public readonly name: LocalizedTextDto,
        public readonly lines: ReadonlyArray<ProductionLineDto>
    ) {}
}

export class ProductionPlanDto {
    public constructor(
        public readonly id: string,
        public readonly name: LocalizedTextDto,
        public readonly blocks: ReadonlyArray<ProductionBlockDto>
    ) {}
}

export class PlanningSnapshotDto {
    public constructor(
        public readonly plans: ReadonlyArray<ProductionPlanDto>,
        public readonly activePlanId: string,
        public readonly activeBlockId: string,
        public readonly activeLineId: string
    ) {}
}

export class CatalogMaterialDto extends MaterialDto {
    public constructor(
        type: string,
        name: string,
        public readonly group: string,
        public readonly subgroup: string,
        public readonly order: string,
        public readonly hidden: boolean,
        public readonly stackSize: number | null
    ) {
        super(type, name);
    }
}

export class ItemSubgroupDto {
    public constructor(public readonly name: string, public readonly order: string) {}
}

export class ItemGroupDto {
    public constructor(public readonly name: string, public readonly order: string, public readonly subgroups: ReadonlyArray<ItemSubgroupDto>) {}
}

export class RecipeDto {
    public constructor(
        public readonly name: string,
        public readonly group: string,
        public readonly subgroup: string,
        public readonly order: string,
        public readonly category: string,
        public readonly energy: number,
        public readonly ingredients: ReadonlyArray<MaterialDto>,
        public readonly products: ReadonlyArray<MaterialDto>,
        public readonly mainProduct: MaterialDto | null,
        public readonly hidden: boolean,
        public readonly maximumProductivity: number
    ) {}
}

export class MachineDto {
    public constructor(
        public readonly name: string,
        public readonly order: string,
        public readonly craftingSpeed: number,
        public readonly craftingCategories: ReadonlyArray<string>,
        public readonly moduleSlots: number
    ) {}
}

export class ModuleDto {
    public constructor(
        public readonly name: string,
        public readonly order: string,
        public readonly speed: number,
        public readonly productivity: number,
        public readonly quality: number,
        public readonly consumption: number
    ) {}
}

export class QualityDto {
    public constructor(public readonly name: string, public readonly order: string, public readonly level: number) {}
}

export class GameCatalogDto {
    public constructor(
        public readonly factorioVersion: string,
        public readonly exporterVersion: string,
        public readonly groups: ReadonlyArray<ItemGroupDto>,
        public readonly materials: ReadonlyArray<CatalogMaterialDto>,
        public readonly recipes: ReadonlyArray<RecipeDto>,
        public readonly machines: ReadonlyArray<MachineDto>,
        public readonly modules: ReadonlyArray<ModuleDto>,
        public readonly qualities: ReadonlyArray<QualityDto>,
        public readonly translations: ReadonlyMap<string, ReadonlyMap<string, string>>
    ) {}
}

export class BomNodeDto {
    public constructor(
        public readonly id: string,
        public readonly nodePath: string,
        public readonly material: MaterialDto,
        public readonly demand: number,
        public readonly boundary: boolean,
        public readonly processId: string | null,
        public readonly children: ReadonlyArray<BomNodeDto>
    ) {}
}

export class ProcessDto {
    public constructor(
        public readonly id: string,
        public readonly choiceKey: string,
        public readonly recipe: RecipeDto,
        public readonly fulfills: MaterialDto,
        public readonly cyclesPerMinute: number,
        public readonly machine: MachineDto | null,
        public readonly machineOptions: ReadonlyArray<MachineDto>,
        public readonly machineSlots: number,
        public readonly beaconSlots: number,
        public readonly exactMachines: number,
        public readonly roundedMachines: number,
        public readonly effectiveSpeed: number,
        public readonly productivityBonus: number,
        public readonly qualityBonus: number,
        public readonly configuration: ProcessConfigurationDto,
        // UI uses the Factorio speed modifier, while calculations use the
        // absolute crafting speed above. Keep both explicit for a future API.
        public readonly speedMultiplier = effectiveSpeed,
        // Stable observation coordinates are display data, not persistence keys.
        public readonly nodePath = "",
        public readonly depth = 0
    ) {}
}

export class BalanceDto {
    public constructor(
        public readonly material: MaterialDto,
        public readonly target: number,
        public readonly output: number,
        public readonly gap: number,
        public readonly surplus: number,
        public readonly met: boolean
    ) {}
}

export class MatrixRowDto {
    public constructor(public readonly material: MaterialDto, public readonly coefficients: ReadonlyArray<number>) {}
}

export class CalculationResultDto {
    public constructor(
        public readonly lineId: string,
        public readonly status: CalculationStatus,
        public readonly objective: string,
        public readonly roots: ReadonlyArray<BomNodeDto>,
        public readonly processes: ReadonlyArray<ProcessDto>,
        public readonly balances: ReadonlyArray<BalanceDto>,
        public readonly inputs: ReadonlyArray<MaterialDto>,
        public readonly matrix: ReadonlyArray<MatrixRowDto>
    ) {}
}

export class BlockObservationDto {
    public constructor(public readonly line: ProductionLineDto, public readonly result: CalculationResultDto) {}
}

export class TargetCatalogDto {
    public constructor(public readonly groups: ReadonlyArray<ItemGroupDto>, public readonly entries: ReadonlyArray<TargetCatalogEntryDto>) {}
}

export class TargetCatalogEntryDto extends CatalogMaterialDto {
    public constructor(material: CatalogMaterialDto, public readonly producerCount: number) {
        super(material.type, material.name, material.group, material.subgroup, material.order, material.hidden, material.stackSize);
    }
}

export class TargetSelectionDto {
    public constructor(
        public readonly material: CatalogMaterialDto,
        public readonly recipe: RecipeDto,
        public readonly minimum: number,
        public readonly createLine: boolean
    ) {}
}

export class RecipeReplacementDto {
    public constructor(
        public readonly lineId: string,
        public readonly choiceKey: string,
        public readonly material: MaterialDto,
        public readonly currentRecipeName: string,
        public readonly demand: number
    ) {}
}

export class GatewayErrorDto {
    public constructor(public readonly code: string, public readonly message: string) {}
}

export class GatewayResultDto<T> {
    private constructor(public readonly value: T | null, public readonly error: GatewayErrorDto | null) {}

    public static success<T>(value: T): GatewayResultDto<T> {
        return new GatewayResultDto(value, null);
    }

    public static failure<T>(code: string, message: string): GatewayResultDto<T> {
        return new GatewayResultDto<T>(null, new GatewayErrorDto(code, message));
    }

    public get succeeded(): boolean {
        return this.error === null;
    }
}
