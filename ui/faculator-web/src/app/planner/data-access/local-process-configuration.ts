import { Service } from "@angular/core";

import { ProcessConfigurationGateway } from "../../core/faculator-api/contracts/process-configuration-gateway";
import {
    GatewayResultDto,
    PlanningSnapshotDto,
    ProductionBlockDto,
    ProductionLineDto,
    ProductionPlanDto,
    ProcessConfigurationDto
} from "../../core/faculator-api/models/faculator-dtos";

@Service()
export class LocalProcessConfiguration implements ProcessConfigurationGateway {
    public async update(
        snapshot: PlanningSnapshotDto,
        lineId: string,
        choiceKey: string,
        configuration: ProcessConfigurationDto
    ): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        let found = false;
        const plans = snapshot.plans.map((plan) => new ProductionPlanDto(plan.id, plan.name, plan.blocks.map((block) =>
            new ProductionBlockDto(block.id, block.name, block.lines.map((line) => {
                if (line.id !== lineId) return line;
                found = true;
                const configurations = new Map(line.processConfigurations);
                configurations.set(choiceKey, configuration);
                return new ProductionLineDto(line.id, line.title, line.targets, line.appliedTargets, line.recipeChoices, configurations, line.exportedOutputs, line.dirty);
            }))
        )));
        return found
            ? GatewayResultDto.success(new PlanningSnapshotDto(plans, snapshot.activePlanId, snapshot.activeBlockId, snapshot.activeLineId))
            : GatewayResultDto.failure("line-not-found", `Unknown line ${lineId}`);
    }
}
