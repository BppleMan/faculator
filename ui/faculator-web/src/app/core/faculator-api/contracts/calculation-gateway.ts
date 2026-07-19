import { CalculationResultDto, GatewayResultDto, ProductionLineDto } from "../models/faculator-dtos";

export interface CalculationGateway {
    calculate(line: ProductionLineDto): Promise<GatewayResultDto<CalculationResultDto>>;
}
