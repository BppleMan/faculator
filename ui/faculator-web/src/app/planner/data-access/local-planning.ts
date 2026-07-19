import { Service } from "@angular/core";

import { PlanningGateway } from "../../core/faculator-api/contracts/planning-gateway";
import {
    GatewayResultDto,
    LocalizedTextDto,
    MaterialDto,
    ModuleSelectionDto,
    PlanningSnapshotDto,
    ProductionBlockDto,
    ProductionLineDto,
    ProductionPlanDto,
    ProcessConfigurationDto,
    TargetDto,
    TargetSelectionDto
} from "../../core/faculator-api/models/faculator-dtos";

type JsonRecord = Record<string, unknown>;

const STORAGE_KEY = "faculator.planning.v1";

@Service()
export class LocalPlanning implements PlanningGateway {
    public async createInitial(): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const restored = this.restore();
        if (restored) return GatewayResultDto.success(restored);
        const line = this.draftLine("base");
        const block = new ProductionBlockDto("production-block-1", new LocalizedTextDto("生产区块 01", "Production block 01"), [line]);
        const plan = new ProductionPlanDto("base-plan", new LocalizedTextDto("基地规划", "Base plan"), [block]);
        return this.save(new PlanningSnapshotDto([plan], plan.id, block.id, line.id));
    }

    public async save(snapshot: PlanningSnapshotDto): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot, (_key, value: unknown) => value instanceof Map ? Object.fromEntries(value) : value));
            return GatewayResultDto.success(snapshot);
        } catch (error: unknown) {
            return GatewayResultDto.failure("planning-storage-failed", error instanceof Error ? error.message : "Unable to persist planning state.");
        }
    }

    public async selectPlan(snapshot: PlanningSnapshotDto, planId: string): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const plan = snapshot.plans.find((candidate) => candidate.id === planId);
        if (!plan) {
            return GatewayResultDto.failure("plan-not-found", `Unknown plan ${planId}`);
        }
        const block = plan.blocks[0];
        return GatewayResultDto.success(new PlanningSnapshotDto(snapshot.plans, plan.id, block.id, block.lines[0].id));
    }

    public async addPlan(snapshot: PlanningSnapshotDto): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const suffix = this.identifier();
        const line = this.draftLine(suffix);
        const block = new ProductionBlockDto(`block-${suffix}`, new LocalizedTextDto("生产区块 01", "Production block 01"), [line]);
        const plan = new ProductionPlanDto(
            `plan-${suffix}`,
            new LocalizedTextDto(`新计划 ${snapshot.plans.length + 1}`, `New plan ${snapshot.plans.length + 1}`),
            [block]
        );
        return GatewayResultDto.success(new PlanningSnapshotDto([...snapshot.plans, plan], plan.id, block.id, line.id));
    }

    public async closePlan(snapshot: PlanningSnapshotDto, planId: string): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        if (snapshot.plans.length === 1) {
            return GatewayResultDto.failure("last-plan", "At least one ProductionPlan must remain.");
        }
        const index = snapshot.plans.findIndex((candidate) => candidate.id === planId);
        if (index < 0) {
            return GatewayResultDto.failure("plan-not-found", `Unknown plan ${planId}`);
        }
        const plans = snapshot.plans.filter((candidate) => candidate.id !== planId);
        if (snapshot.activePlanId !== planId) {
            return GatewayResultDto.success(new PlanningSnapshotDto(plans, snapshot.activePlanId, snapshot.activeBlockId, snapshot.activeLineId));
        }
        const plan = plans[Math.min(index, plans.length - 1)];
        const block = plan.blocks[0];
        return GatewayResultDto.success(new PlanningSnapshotDto(plans, plan.id, block.id, block.lines[0].id));
    }

    public async selectBlock(snapshot: PlanningSnapshotDto, blockId: string): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const plan = this.activePlan(snapshot);
        const block = plan?.blocks.find((candidate) => candidate.id === blockId);
        if (!block) {
            return GatewayResultDto.failure("block-not-found", `Unknown block ${blockId}`);
        }
        return GatewayResultDto.success(new PlanningSnapshotDto(snapshot.plans, snapshot.activePlanId, block.id, block.lines[0].id));
    }

    public async addBlock(snapshot: PlanningSnapshotDto): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const plan = this.activePlan(snapshot);
        if (!plan) {
            return GatewayResultDto.failure("plan-not-found", "No active plan.");
        }
        const suffix = this.identifier();
        const line = this.draftLine(suffix);
        const number = String(plan.blocks.length + 1).padStart(2, "0");
        const block = new ProductionBlockDto(
            `block-${suffix}`,
            new LocalizedTextDto(`生产区块 ${number}`, `Production block ${number}`),
            [line]
        );
        const plans = snapshot.plans.map((candidate) => candidate.id === plan.id
            ? new ProductionPlanDto(candidate.id, candidate.name, [...candidate.blocks, block])
            : candidate);
        return GatewayResultDto.success(new PlanningSnapshotDto(plans, plan.id, block.id, line.id));
    }

    public async deleteBlock(snapshot: PlanningSnapshotDto, blockId: string): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const plan = this.activePlan(snapshot);
        if (!plan) {
            return GatewayResultDto.failure("plan-not-found", "No active plan.");
        }
        if (plan.blocks.length === 1) {
            return GatewayResultDto.failure("last-block", "At least one ProductionBlock must remain.");
        }
        const index = plan.blocks.findIndex((candidate) => candidate.id === blockId);
        if (index < 0) {
            return GatewayResultDto.failure("block-not-found", `Unknown block ${blockId}`);
        }
        const blocks = plan.blocks.filter((candidate) => candidate.id !== blockId);
        const plans = snapshot.plans.map((candidate) => candidate.id === plan.id
            ? new ProductionPlanDto(candidate.id, candidate.name, blocks)
            : candidate);
        if (snapshot.activeBlockId !== blockId) {
            return GatewayResultDto.success(new PlanningSnapshotDto(plans, plan.id, snapshot.activeBlockId, snapshot.activeLineId));
        }
        const block = blocks[Math.min(index, blocks.length - 1)];
        return GatewayResultDto.success(new PlanningSnapshotDto(plans, plan.id, block.id, block.lines[0].id));
    }

    public async selectLine(snapshot: PlanningSnapshotDto, lineId: string): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const block = this.activeBlock(snapshot);
        if (!block?.lines.some((candidate) => candidate.id === lineId)) {
            return GatewayResultDto.failure("line-not-found", `Unknown line ${lineId}`);
        }
        return GatewayResultDto.success(new PlanningSnapshotDto(snapshot.plans, snapshot.activePlanId, snapshot.activeBlockId, lineId));
    }

    public async applyTarget(snapshot: PlanningSnapshotDto, selection: TargetSelectionDto): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const block = this.activeBlock(snapshot);
        if (!block) {
            return GatewayResultDto.failure("block-not-found", "No active block.");
        }
        const suffix = this.identifier();
        const target = new TargetDto(selection.material.type, selection.material.name, selection.minimum);
        const title = new LocalizedTextDto(`${selection.material.name}生产线`, `${selection.material.name} line`);
        const line = new ProductionLineDto(
            selection.createLine ? `recipe-${suffix}` : snapshot.activeLineId,
            title,
            [target],
            [target],
            new Map([[target.key, selection.recipe.name]]),
            new Map(),
            [],
            false
        );
        const lines = selection.createLine
            ? [...block.lines, line]
            : block.lines.map((candidate) => candidate.id === snapshot.activeLineId ? line : candidate);
        const blocks = this.activePlan(snapshot)?.blocks.map((candidate) => candidate.id === block.id
            ? new ProductionBlockDto(candidate.id, candidate.name, lines)
            : candidate) ?? [];
        const plans = snapshot.plans.map((candidate) => candidate.id === snapshot.activePlanId
            ? new ProductionPlanDto(candidate.id, candidate.name, blocks)
            : candidate);
        return GatewayResultDto.success(new PlanningSnapshotDto(plans, snapshot.activePlanId, block.id, line.id));
    }

    public async updateTargetRate(
        snapshot: PlanningSnapshotDto,
        lineId: string,
        targetIndex: number,
        minimum: number
    ): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        return this.updateLine(snapshot, lineId, (line) => {
            if (!line.targets[targetIndex]) return null;
            const targets = line.targets.map((target, index) => index === targetIndex ? new TargetDto(target.type, target.name, Math.max(0, minimum)) : target);
            return new ProductionLineDto(line.id, line.title, targets, line.appliedTargets, line.recipeChoices, line.processConfigurations, line.exportedOutputs, true);
        });
    }

    public async removeTarget(snapshot: PlanningSnapshotDto, lineId: string, targetIndex: number): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        return this.updateLine(snapshot, lineId, (line) => {
            if (line.targets.length <= 1 || !line.targets[targetIndex]) return null;
            return new ProductionLineDto(
                line.id,
                line.title,
                line.targets.filter((_, index) => index !== targetIndex),
                line.appliedTargets,
                line.recipeChoices,
                line.processConfigurations,
                line.exportedOutputs,
                true
            );
        }, "last-target");
    }

    public async applyTargets(snapshot: PlanningSnapshotDto, lineId: string): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        return this.updateLine(snapshot, lineId, (line) => new ProductionLineDto(
            line.id,
            line.title,
            line.targets,
            line.targets.map((target) => new TargetDto(target.type, target.name, target.minimum)),
            line.recipeChoices,
            line.processConfigurations,
            line.exportedOutputs,
            false
        ));
    }

    public async toggleExport(snapshot: PlanningSnapshotDto, lineId: string, materialName: string): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        return this.updateLine(snapshot, lineId, (line) => {
            if (!materialName) return null;
            const exportedOutputs = line.exportedOutputs.includes(materialName)
                ? line.exportedOutputs.filter((name) => name !== materialName)
                : [...line.exportedOutputs, materialName];
            return new ProductionLineDto(
                line.id,
                line.title,
                line.targets,
                line.appliedTargets,
                line.recipeChoices,
                line.processConfigurations,
                exportedOutputs,
                line.dirty
            );
        }, "output-not-found");
    }

    public async promoteOutput(
        snapshot: PlanningSnapshotDto,
        sourceLineId: string,
        material: MaterialDto
    ): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        const block = this.activeBlock(snapshot);
        if (!block?.lines.some((line) => line.id === sourceLineId)) {
            return GatewayResultDto.failure("line-not-found", `Unknown line ${sourceLineId}`);
        }
        const suffix = this.identifier();
        const target = new TargetDto(material.type, material.name, 60);
        const line = new ProductionLineDto(
            `recipe-${suffix}`,
            new LocalizedTextDto(`${material.name}生产线`, `${material.name} line`),
            [target],
            [target],
            new Map(),
            new Map(),
            [],
            false
        );
        const plans = snapshot.plans.map((plan) => plan.id === snapshot.activePlanId
            ? new ProductionPlanDto(plan.id, plan.name, plan.blocks.map((candidate) => candidate.id === block.id
                ? new ProductionBlockDto(candidate.id, candidate.name, [...candidate.lines, line])
                : candidate))
            : plan);
        return GatewayResultDto.success(new PlanningSnapshotDto(plans, snapshot.activePlanId, block.id, line.id));
    }

    private draftLine(suffix: string): ProductionLineDto {
        return new ProductionLineDto(
            `draft-${suffix}`,
            new LocalizedTextDto("尚未选择目标", "Target not selected"),
            [],
            [],
            new Map(),
            new Map(),
            [],
            false
        );
    }

    private activePlan(snapshot: PlanningSnapshotDto): ProductionPlanDto | undefined {
        return snapshot.plans.find((candidate) => candidate.id === snapshot.activePlanId);
    }

    private activeBlock(snapshot: PlanningSnapshotDto): ProductionBlockDto | undefined {
        return this.activePlan(snapshot)?.blocks.find((candidate) => candidate.id === snapshot.activeBlockId);
    }

    private updateLine(
        snapshot: PlanningSnapshotDto,
        lineId: string,
        updater: (line: ProductionLineDto) => ProductionLineDto | null,
        invalidCode = "target-not-found"
    ): GatewayResultDto<PlanningSnapshotDto> {
        let updated = false;
        const plans = snapshot.plans.map((plan) => new ProductionPlanDto(plan.id, plan.name, plan.blocks.map((block) =>
            new ProductionBlockDto(block.id, block.name, block.lines.map((line) => {
                if (line.id !== lineId) return line;
                const replacement = updater(line);
                if (!replacement) return line;
                updated = true;
                return replacement;
            }))
        )));
        return updated
            ? GatewayResultDto.success(new PlanningSnapshotDto(plans, snapshot.activePlanId, snapshot.activeBlockId, snapshot.activeLineId))
            : GatewayResultDto.failure(invalidCode, "The requested ProductionLine transition is not allowed.");
    }

    private identifier(): string {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }

    private restore(): PlanningSnapshotDto | null {
        try {
            const value = localStorage.getItem(STORAGE_KEY);
            if (!value) return null;
            return this.mapSnapshot(this.record(JSON.parse(value)));
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    }

    private mapSnapshot(raw: JsonRecord): PlanningSnapshotDto | null {
        const plans = this.records(raw["plans"]).map((plan) => this.mapPlan(plan));
        const activePlanId = this.string(raw["activePlanId"]);
        const activeBlockId = this.string(raw["activeBlockId"]);
        const activeLineId = this.string(raw["activeLineId"]);
        const activePlan = plans.find((plan) => plan.id === activePlanId);
        const activeBlock = activePlan?.blocks.find((block) => block.id === activeBlockId);
        if (!activeBlock?.lines.some((line) => line.id === activeLineId)) return null;
        return new PlanningSnapshotDto(plans, activePlanId, activeBlockId, activeLineId);
    }

    private mapPlan(raw: JsonRecord): ProductionPlanDto {
        return new ProductionPlanDto(this.string(raw["id"]), this.mapText(raw["name"]), this.records(raw["blocks"]).map((block) => this.mapBlock(block)));
    }

    private mapBlock(raw: JsonRecord): ProductionBlockDto {
        return new ProductionBlockDto(this.string(raw["id"]), this.mapText(raw["name"]), this.records(raw["lines"]).map((line) => this.mapLine(line)));
    }

    private mapLine(raw: JsonRecord): ProductionLineDto {
        return new ProductionLineDto(
            this.string(raw["id"]),
            this.mapText(raw["title"]),
            this.records(raw["targets"]).map((target) => this.mapTarget(target)),
            this.records(raw["appliedTargets"]).map((target) => this.mapTarget(target)),
            new Map(Object.entries(this.record(raw["recipeChoices"])).flatMap(([key, value]) => typeof value === "string" ? [[key, value]] : [])),
            new Map(Object.entries(this.record(raw["processConfigurations"])).map(([key, value]) => [key, this.mapConfiguration(value)])),
            this.strings(raw["exportedOutputs"]),
            raw["dirty"] === true
        );
    }

    private mapConfiguration(value: unknown): ProcessConfigurationDto {
        const raw = this.record(value);
        return new ProcessConfigurationDto(
            this.string(raw["machineName"]),
            this.recordsOrNull(raw["machineModuleSlots"]).map((slot) => slot ? this.mapModule(slot) : null),
            this.number(raw["beaconCount"]),
            this.recordsOrNull(raw["beaconModuleSlots"]).map((slot) => slot ? this.mapModule(slot) : null)
        );
    }

    private mapModule(raw: JsonRecord): ModuleSelectionDto {
        return new ModuleSelectionDto(this.string(raw["moduleName"]), this.string(raw["qualityName"]));
    }

    private mapTarget(raw: JsonRecord): TargetDto {
        return new TargetDto(this.string(raw["type"]), this.string(raw["name"]), this.number(raw["minimum"]));
    }

    private mapText(value: unknown): LocalizedTextDto {
        const raw = this.record(value);
        return new LocalizedTextDto(this.string(raw["chinese"]), this.string(raw["english"]));
    }

    private records(value: unknown): ReadonlyArray<JsonRecord> {
        return Array.isArray(value) ? value.filter((entry): entry is JsonRecord => this.isRecord(entry)) : [];
    }

    private recordsOrNull(value: unknown): ReadonlyArray<JsonRecord | null> {
        return Array.isArray(value) ? value.map((entry) => this.isRecord(entry) ? entry : null) : [];
    }

    private strings(value: unknown): ReadonlyArray<string> {
        return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
    }

    private record(value: unknown): JsonRecord {
        return this.isRecord(value) ? value : {};
    }

    private isRecord(value: unknown): value is JsonRecord {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }

    private string(value: unknown): string {
        return typeof value === "string" ? value : "";
    }

    private number(value: unknown): number {
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
    }
}
