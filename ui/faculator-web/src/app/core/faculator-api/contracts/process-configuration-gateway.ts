import { GatewayResultDto, PlanningSnapshotDto, ProcessConfigurationDto } from "../models/faculator-dtos";

export interface ProcessConfigurationGateway {
    update(snapshot: PlanningSnapshotDto, lineId: string, choiceKey: string, configuration: ProcessConfigurationDto): Promise<GatewayResultDto<PlanningSnapshotDto>>;
}
