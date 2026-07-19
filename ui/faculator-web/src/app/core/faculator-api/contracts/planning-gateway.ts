import { GatewayResultDto, MaterialDto, PlanningSnapshotDto, TargetSelectionDto } from "../models/faculator-dtos";

export interface PlanningGateway {
    createInitial(): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    save(snapshot: PlanningSnapshotDto): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    selectPlan(snapshot: PlanningSnapshotDto, planId: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    addPlan(snapshot: PlanningSnapshotDto): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    closePlan(snapshot: PlanningSnapshotDto, planId: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    selectBlock(snapshot: PlanningSnapshotDto, blockId: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    addBlock(snapshot: PlanningSnapshotDto): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    deleteBlock(snapshot: PlanningSnapshotDto, blockId: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    selectLine(snapshot: PlanningSnapshotDto, lineId: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    applyTarget(snapshot: PlanningSnapshotDto, selection: TargetSelectionDto): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    updateTargetRate(snapshot: PlanningSnapshotDto, lineId: string, targetIndex: number, minimum: number): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    removeTarget(snapshot: PlanningSnapshotDto, lineId: string, targetIndex: number): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    applyTargets(snapshot: PlanningSnapshotDto, lineId: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    toggleExport(snapshot: PlanningSnapshotDto, lineId: string, materialName: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
    promoteOutput(snapshot: PlanningSnapshotDto, sourceLineId: string, material: MaterialDto): Promise<GatewayResultDto<PlanningSnapshotDto>>;
}
