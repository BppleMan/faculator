import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import {
    CALCULATION_GATEWAY,
    GAME_CATALOG_GATEWAY,
    PLANNING_GATEWAY,
    PROCESS_CONFIGURATION_GATEWAY,
    RECIPE_GATEWAY
} from "../core/faculator-api/contracts/gateway-tokens";
import {
    CalculationResultDto,
    GameCatalogDto,
    GatewayResultDto,
    LocalizedTextDto,
    PlanningSnapshotDto,
    ProductionBlockDto,
    ProductionLineDto,
    ProductionPlanDto,
    TargetDto,
    TargetCatalogDto
} from "../core/faculator-api/models/faculator-dtos";
import { CalculationStatus } from "../core/faculator-api/models/calculation-status";
import { PlannerStore } from "./planner-store";

describe("PlannerStore", () => {
    it("orders line selection before target focus and opening its target dialog", async () => {
        const initial = snapshot("line-a");
        const selected = vi.fn(async (current: PlanningSnapshotDto, lineId: string) => GatewayResultDto.success(new PlanningSnapshotDto(
            current.plans, current.activePlanId, current.activeBlockId, lineId
        )));
        TestBed.configureTestingModule({
            providers: [
                { provide: GAME_CATALOG_GATEWAY, useValue: { load: async () => GatewayResultDto.success(new GameCatalogDto("test", "test", [], [], [], [], [], [], new Map())) } },
                {
                    provide: PLANNING_GATEWAY,
                    useValue: {
                        createInitial: async () => GatewayResultDto.success(initial),
                        save: async (current: PlanningSnapshotDto) => GatewayResultDto.success(current),
                        selectLine: selected
                    }
                },
                {
                    provide: CALCULATION_GATEWAY,
                    useValue: {
                        calculate: async (line: ProductionLineDto) => GatewayResultDto.success(new CalculationResultDto(
                            line.id, CalculationStatus.Feasible, "unconfigured", [], [], [], [], []
                        ))
                    }
                },
                { provide: RECIPE_GATEWAY, useValue: { getTargetCatalog: async () => GatewayResultDto.success(new TargetCatalogDto([], [])) } },
                { provide: PROCESS_CONFIGURATION_GATEWAY, useValue: {} }
            ]
        });
        const store = TestBed.inject(PlannerStore);
        await store.initialize();

        await store.selectLineAndProcess("line-b", "process-b");

        expect(selected).toHaveBeenCalledOnce();
        expect(store.activeLine()?.id).toBe("line-b");
        expect(store.selectedProcessId()).toBe("process-b");

        await store.openTargetDialogForLine("line-b");

        expect(selected).toHaveBeenCalledOnce();
        expect(store.activeLine()?.id).toBe("line-b");
        expect(store.targetDialogOpen()).toBe(true);
        expect(store.targetDialogCreatesLine()).toBe(false);
    });

    it("keeps the solve button in its feedback state for the prototype's 520ms minimum", async () => {
        vi.useFakeTimers();
        try {
            const initial = snapshotWithTarget();
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    { provide: GAME_CATALOG_GATEWAY, useValue: { load: async () => GatewayResultDto.success(new GameCatalogDto("test", "test", [], [], [], [], [], [], new Map())) } },
                    {
                        provide: PLANNING_GATEWAY,
                        useValue: {
                            createInitial: async () => GatewayResultDto.success(initial),
                            save: async (current: PlanningSnapshotDto) => GatewayResultDto.success(current),
                            applyTargets: async (current: PlanningSnapshotDto) => GatewayResultDto.success(current)
                        }
                    },
                    {
                        provide: CALCULATION_GATEWAY,
                        useValue: {
                            calculate: async (line: ProductionLineDto) => GatewayResultDto.success(new CalculationResultDto(
                                line.id, CalculationStatus.Feasible, "bom-expansion", [], [], [], [], []
                            ))
                        }
                    },
                    { provide: RECIPE_GATEWAY, useValue: { getTargetCatalog: async () => GatewayResultDto.success(new TargetCatalogDto([], [])) } },
                    { provide: PROCESS_CONFIGURATION_GATEWAY, useValue: {} }
                ]
            });
            const store = TestBed.inject(PlannerStore);
            await store.initialize();

            const applying = store.applyTargets();
            await Promise.resolve();
            expect(store.solvingLineId()).toBe("line-a");

            await vi.advanceTimersByTimeAsync(519);
            expect(store.solvingLineId()).toBe("line-a");
            await vi.advanceTimersByTimeAsync(1);
            await applying;
            expect(store.solvingLineId()).toBe("");
        } finally {
            vi.useRealTimers();
        }
    });
});

function snapshot(activeLineId: string): PlanningSnapshotDto {
    const first = new ProductionLineDto("line-a", new LocalizedTextDto("生产线 A", "Line A"), [], [], new Map(), new Map(), [], false);
    const second = new ProductionLineDto("line-b", new LocalizedTextDto("生产线 B", "Line B"), [], [], new Map(), new Map(), [], false);
    const block = new ProductionBlockDto("block", new LocalizedTextDto("区块", "Block"), [first, second]);
    const plan = new ProductionPlanDto("plan", new LocalizedTextDto("计划", "Plan"), [block]);
    return new PlanningSnapshotDto([plan], plan.id, block.id, activeLineId);
}

function snapshotWithTarget(): PlanningSnapshotDto {
    const target = new TargetDto("item", "utility-science-pack", 60);
    const line = new ProductionLineDto(
        "line-a",
        new LocalizedTextDto("生产线 A", "Line A"),
        [target],
        [target],
        new Map(),
        new Map(),
        [],
        false
    );
    const block = new ProductionBlockDto("block", new LocalizedTextDto("区块", "Block"), [line]);
    const plan = new ProductionPlanDto("plan", new LocalizedTextDto("计划", "Plan"), [block]);
    return new PlanningSnapshotDto([plan], plan.id, block.id, line.id);
}
