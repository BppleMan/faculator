import { GatewayResultDto, GameCatalogDto } from "../models/faculator-dtos";

export interface GameCatalogGateway {
    load(): Promise<GatewayResultDto<GameCatalogDto>>;
}
