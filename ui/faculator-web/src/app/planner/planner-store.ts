import { computed, inject, Service, signal } from "@angular/core";

import {
    CALCULATION_GATEWAY,
    GAME_CATALOG_GATEWAY,
    PLANNING_GATEWAY,
    RECIPE_GATEWAY,
    PROCESS_CONFIGURATION_GATEWAY
} from "../core/faculator-api/contracts/gateway-tokens";
import {
    BlockObservationDto,
    CalculationResultDto,
    GameCatalogDto,
    GatewayResultDto,
    MaterialDto,
    PlanningSnapshotDto,
    ProductionBlockDto,
    ProductionLineDto,
    ProductionPlanDto,
    ProcessConfigurationDto,
    ProcessDto,
    RecipeDto,
    RecipeReplacementDto,
    TargetCatalogDto,
    TargetSelectionDto
} from "../core/faculator-api/models/faculator-dtos";
import { LoadState } from "../core/faculator-api/models/load-state";
import { CalculationStatus } from "../core/faculator-api/models/calculation-status";
import { Locale } from "../core/faculator-api/models/locale";
import { ObservationView } from "../core/faculator-api/models/observation-view";
import { ResultTab } from "../core/faculator-api/models/result-tab";

const MINIMUM_SOLVE_FEEDBACK_MS = 520;

@Service()
export class PlannerStore {
    private readonly catalogGateway = inject(GAME_CATALOG_GATEWAY);
    private readonly planningGateway = inject(PLANNING_GATEWAY);
    private readonly calculationGateway = inject(CALCULATION_GATEWAY);
    private readonly recipeGateway = inject(RECIPE_GATEWAY);
    private readonly processConfigurationGateway = inject(PROCESS_CONFIGURATION_GATEWAY);

    private readonly snapshotState = signal<PlanningSnapshotDto | null>(null);
    private readonly catalogState = signal<GameCatalogDto | null>(null);
    private readonly targetCatalogState = signal<TargetCatalogDto | null>(null);
    private readonly calculationState = signal<ReadonlyMap<string, CalculationResultDto>>(new Map());
    private readonly loadStateValue = signal(LoadState.Idle);
    private readonly errorValue = signal("");
    private readonly recipeOptionsState = signal<ReadonlyArray<RecipeDto>>([]);

    public readonly locale = signal(Locale.Chinese);
    public readonly observationView = signal(ObservationView.MaterialRail);
    public readonly resultTab = signal(ResultTab.Delivery);
    public readonly resultDrawerCollapsed = signal(true);
    public readonly targetDialogOpen = signal(false);
    public readonly targetDialogCreatesLine = signal(false);
    public readonly goalRailOpen = signal(true);
    public readonly selectedProcessId = signal("");
    public readonly solvingLineId = signal("");
    public readonly promoteDialogOpen = signal(false);
    public readonly recipeDialogProcess = signal<ProcessDto | null>(null);
    public readonly recipeOptions = this.recipeOptionsState.asReadonly();
    public readonly loadState = this.loadStateValue.asReadonly();
    public readonly error = this.errorValue.asReadonly();
    public readonly snapshot = this.snapshotState.asReadonly();
    public readonly catalog = this.catalogState.asReadonly();
    public readonly targetCatalog = this.targetCatalogState.asReadonly();
    public readonly activePlan = computed(() => this.findActivePlan(this.snapshotState()));
    public readonly activeBlock = computed(() => this.findActiveBlock(this.snapshotState()));
    public readonly activeLine = computed(() => this.findActiveLine(this.snapshotState()));
    public readonly observations = computed(() => {
        const block = this.activeBlock();
        const calculations = this.calculationState();
        return block?.lines.flatMap((line) => {
            const result = calculations.get(line.id);
            return result ? [new BlockObservationDto(line, result)] : [];
        }) ?? [];
    });
    public readonly activeResult = computed(() => {
        const line = this.activeLine();
        return line ? this.calculationState().get(line.id) ?? null : null;
    });
    public readonly displayName = (type: string, name: string): string => this.nameOf(type, name);
    public readonly roundedMachineCount = computed(() => this.activeResult()?.processes.reduce((sum, process) => sum + process.roundedMachines, 0) ?? 0);
    public readonly promotionOutputs = computed(() => {
        const line = this.activeLine();
        const result = this.activeResult();
        if (!line || !result) return [];
        const unique = new Map<string, MaterialDto>();
        line.targets.forEach((target) => unique.set(target.key, new MaterialDto(target.type, target.name)));
        result.processes.forEach((process) => process.recipe.products.forEach((product) => {
            if (!unique.has(product.key)) unique.set(product.key, new MaterialDto(product.type, product.name));
        }));
        return [...unique.values()];
    });

    public async initialize(): Promise<void> {
        this.loadStateValue.set(LoadState.Loading);
        this.errorValue.set("");
        const catalogResult = await this.catalogGateway.load();
        if (!this.accept(catalogResult, this.catalogState)) return;
        const planningResult = await this.planningGateway.createInitial();
        if (!this.accept(planningResult, this.snapshotState)) return;
        const targetCatalogResult = await this.recipeGateway.getTargetCatalog();
        if (!this.accept(targetCatalogResult, this.targetCatalogState)) return;
        await this.refreshCalculations();
        this.loadStateValue.set(LoadState.Ready);
    }

    public setLocale(locale: Locale): void {
        this.locale.set(locale);
    }

    public setObservationView(view: ObservationView): void {
        this.observationView.set(view);
    }

    public setResultTab(tab: ResultTab): void {
        this.resultTab.set(tab);
        this.resultDrawerCollapsed.set(false);
    }

    public openTargetDialog(createLine: boolean): void {
        this.targetDialogCreatesLine.set(createLine);
        this.targetDialogOpen.set(true);
    }

    public async openTargetDialogForLine(lineId: string): Promise<void> {
        if (this.activeLine()?.id !== lineId) await this.selectLine(lineId);
        if (this.activeLine()?.id !== lineId) return;
        this.openTargetDialog(false);
    }

    public closeTargetDialog(): void {
        this.targetDialogOpen.set(false);
    }

    public async selectPlan(planId: string): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.selectPlan(snapshot, planId));
    }

    public async addPlan(): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.addPlan(snapshot));
    }

    public async closePlan(planId: string): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.closePlan(snapshot, planId));
    }

    public async selectBlock(blockId: string): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.selectBlock(snapshot, blockId));
    }

    public async addBlock(): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.addBlock(snapshot));
    }

    public async deleteBlock(blockId: string): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.deleteBlock(snapshot, blockId));
    }

    public async selectLine(lineId: string): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.selectLine(snapshot, lineId));
    }

    /** A target anchor changes ownership before applying the visual process focus. */
    public async selectLineAndProcess(lineId: string, processId: string): Promise<void> {
        if (this.activeLine()?.id !== lineId) await this.selectLine(lineId);
        if (this.activeLine()?.id === lineId) this.selectedProcessId.set(processId);
    }

    public async applyTarget(selection: TargetSelectionDto): Promise<void> {
        await this.mutate((snapshot) => this.planningGateway.applyTarget(snapshot, selection));
        this.closeTargetDialog();
    }

    public async openRecipeAlternatives(process: ProcessDto): Promise<void> {
        const result = await this.recipeGateway.findProducers(process.fulfills);
        if (!this.acceptCommand(result)) return;
        this.recipeOptionsState.set(result.value ?? []);
        this.recipeDialogProcess.set(process);
    }

    public async replaceRecipe(recipeName: string): Promise<void> {
        const snapshot = this.snapshotState();
        const line = this.activeLine();
        const process = this.recipeDialogProcess();
        if (!snapshot || !line || !process) return;
        const request = new RecipeReplacementDto(line.id, process.choiceKey, process.fulfills, process.recipe.name, process.cyclesPerMinute);
        await this.acceptMutation(await this.recipeGateway.replaceRecipe(snapshot, request, recipeName));
        this.recipeDialogProcess.set(null);
    }

    public async updateProcessConfiguration(process: ProcessDto, configuration: ProcessConfigurationDto): Promise<void> {
        const snapshot = this.snapshotState();
        const line = this.activeLine();
        if (!snapshot || !line || !process) return;
        await this.acceptMutation(await this.processConfigurationGateway.update(snapshot, line.id, process.choiceKey, configuration));
    }

    public async updateTargetRate(targetIndex: number, minimum: number): Promise<void> {
        const snapshot = this.snapshotState();
        const line = this.activeLine();
        if (!snapshot || !line) return;
        await this.acceptPlanningChange(await this.planningGateway.updateTargetRate(snapshot, line.id, targetIndex, minimum), false);
    }

    public async removeTarget(targetIndex: number): Promise<void> {
        const snapshot = this.snapshotState();
        const line = this.activeLine();
        if (!snapshot || !line) return;
        await this.acceptPlanningChange(await this.planningGateway.removeTarget(snapshot, line.id, targetIndex), false);
    }

    public async applyTargets(): Promise<void> {
        const snapshot = this.snapshotState();
        const line = this.activeLine();
        if (!snapshot || !line || line.targets.length === 0) return;
        this.solvingLineId.set(line.id);
        try {
            const [result] = await Promise.all([
                this.planningGateway.applyTargets(snapshot, line.id),
                this.waitForMinimumSolveFeedback()
            ]);
            await this.acceptPlanningChange(result, true);
        } finally {
            this.solvingLineId.set("");
        }
    }

    public async toggleExport(materialName: string): Promise<void> {
        const snapshot = this.snapshotState();
        const line = this.activeLine();
        if (!snapshot || !line) return;
        await this.acceptPlanningChange(await this.planningGateway.toggleExport(snapshot, line.id, materialName), false);
    }

    public async promoteOutput(material: MaterialDto): Promise<void> {
        const snapshot = this.snapshotState();
        const line = this.activeLine();
        if (!snapshot || !line) return;
        await this.acceptPlanningChange(await this.planningGateway.promoteOutput(snapshot, line.id, material), true);
        this.promoteDialogOpen.set(false);
    }

    public nameOf(type: string, name: string): string {
        return this.catalogState()?.translations.get(this.locale())?.get(`${type}:${name}`) ?? name.replaceAll("-", " ");
    }

    /** Presentation copy lives at the UI boundary; gateway status values stay API-shaped. */
    public calculationStatusLabel(status: CalculationStatus): string {
        const chinese = this.locale() === Locale.Chinese;
        switch (status) {
            case CalculationStatus.Feasible: return chinese ? "目标可满足" : "Targets feasible";
            case CalculationStatus.Infeasible: return chinese ? "存在缺口" : "Shortage detected";
            case CalculationStatus.Unconfigured: return chinese ? "等待选择目标" : "Waiting for target";
        }
    }

    public pendingStatusLabel(): string {
        return this.locale() === Locale.Chinese ? "约束已修改" : "Constraints changed";
    }

    private async mutate(
        operation: (snapshot: PlanningSnapshotDto) => Promise<GatewayResultDto<PlanningSnapshotDto>>
    ): Promise<void> {
        const snapshot = this.snapshotState();
        if (!snapshot) return;
        const result = await operation(snapshot);
        if (result.value) {
            this.snapshotState.set(result.value);
            await this.planningGateway.save(result.value);
            this.errorValue.set("");
            this.selectedProcessId.set("");
            await this.refreshCalculations();
        } else {
            this.errorValue.set(result.error?.message ?? "Unknown planning error");
        }
    }

    private async acceptMutation(result: GatewayResultDto<PlanningSnapshotDto>): Promise<void> {
        if (!result.value) {
            this.errorValue.set(result.error?.message ?? "Unknown command error");
            return;
        }
        this.snapshotState.set(result.value);
        await this.planningGateway.save(result.value);
        this.errorValue.set("");
        await this.refreshCalculations();
    }

    private async acceptPlanningChange(result: GatewayResultDto<PlanningSnapshotDto>, recalculate: boolean): Promise<void> {
        if (!result.value) {
            this.errorValue.set(result.error?.message ?? "Unknown planning command error");
            return;
        }
        this.snapshotState.set(result.value);
        await this.planningGateway.save(result.value);
        this.errorValue.set("");
        if (recalculate) await this.refreshCalculations();
    }

    private acceptCommand<T>(result: GatewayResultDto<T>): boolean {
        if (result.value !== null) return true;
        this.errorValue.set(result.error?.message ?? "Unknown command error");
        return false;
    }

    private async refreshCalculations(): Promise<void> {
        const snapshot = this.snapshotState();
        if (!snapshot) return;
        const lines = snapshot.plans.flatMap((plan) => plan.blocks.flatMap((block) => block.lines));
        const entries = await Promise.all(lines.map(async (line) => [line.id, await this.calculationGateway.calculate(line)] as const));
        this.calculationState.set(new Map(entries.flatMap(([lineId, result]) => result.value ? [[lineId, result.value] as const] : [])));
    }

    /**
     * This is UI feedback only. The planning gateway remains fully replaceable by a
     * backend; a slower remote solve naturally extends this state beyond the minimum.
     */
    private waitForMinimumSolveFeedback(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, MINIMUM_SOLVE_FEEDBACK_MS));
    }

    private accept<T>(result: GatewayResultDto<T>, target: { set(value: T): void }): boolean {
        if (result.value) {
            target.set(result.value);
            return true;
        }
        this.errorValue.set(result.error?.message ?? "Unknown gateway error");
        this.loadStateValue.set(LoadState.Failed);
        return false;
    }

    private findActivePlan(snapshot: PlanningSnapshotDto | null): ProductionPlanDto | null {
        return snapshot?.plans.find((plan) => plan.id === snapshot.activePlanId) ?? null;
    }

    private findActiveBlock(snapshot: PlanningSnapshotDto | null): ProductionBlockDto | null {
        const plan = this.findActivePlan(snapshot);
        return plan?.blocks.find((block) => block.id === snapshot?.activeBlockId) ?? null;
    }

    private findActiveLine(snapshot: PlanningSnapshotDto | null): ProductionLineDto | null {
        const block = this.findActiveBlock(snapshot);
        return block?.lines.find((line) => line.id === snapshot?.activeLineId) ?? null;
    }
}
