import {
    GatewayResultDto,
    MaterialDto,
    PlanningSnapshotDto,
    RecipeDto,
    RecipeReplacementDto,
    TargetCatalogDto
} from "../models/faculator-dtos";

export interface RecipeGateway {
    getTargetCatalog(): Promise<GatewayResultDto<TargetCatalogDto>>;
    findProducers(material: MaterialDto): Promise<GatewayResultDto<ReadonlyArray<RecipeDto>>>;
    replaceRecipe(snapshot: PlanningSnapshotDto, request: RecipeReplacementDto, recipeName: string): Promise<GatewayResultDto<PlanningSnapshotDto>>;
}
