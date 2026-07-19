import { TestBed } from "@angular/core/testing";

import {
    LocalizedTextDto,
    ModuleSelectionDto,
    PlanningSnapshotDto,
    ProcessConfigurationDto,
    ProductionBlockDto,
    ProductionLineDto,
    ProductionPlanDto
} from "../../core/faculator-api/models/faculator-dtos";
import { LocalProcessConfiguration } from "./local-process-configuration";

describe("LocalProcessConfiguration", () => {
    let service: LocalProcessConfiguration;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LocalProcessConfiguration);
    });

    it("updates one process instance without changing the original snapshot", async () => {
        const line = new ProductionLineDto("line", new LocalizedTextDto("生产线", "Line"), [], [], new Map(), new Map(), [], false);
        const block = new ProductionBlockDto("block", new LocalizedTextDto("区块", "Block"), [line]);
        const plan = new ProductionPlanDto("plan", new LocalizedTextDto("计划", "Plan"), [block]);
        const snapshot = new PlanningSnapshotDto([plan], plan.id, block.id, line.id);
        const configuration = new ProcessConfigurationDto(
            "assembling-machine-2",
            [new ModuleSelectionDto("speed-module", "rare")],
            4,
            [new ModuleSelectionDto("speed-module-3", "epic")]
        );

        const updated = (await service.update(snapshot, line.id, "instance:target-0", configuration)).value!;

        expect(updated.plans[0].blocks[0].lines[0].processConfigurations.get("instance:target-0")).toEqual(configuration);
        expect(snapshot.plans[0].blocks[0].lines[0].processConfigurations.size).toBe(0);
    });
});
