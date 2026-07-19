import { InjectionToken } from "@angular/core";

import { CalculationGateway } from "./calculation-gateway";
import { GameCatalogGateway } from "./game-catalog-gateway";
import { PlanningGateway } from "./planning-gateway";
import { ProcessConfigurationGateway } from "./process-configuration-gateway";
import { RecipeGateway } from "./recipe-gateway";

export const GAME_CATALOG_GATEWAY = new InjectionToken<GameCatalogGateway>("faculator.game-catalog-gateway");
export const PLANNING_GATEWAY = new InjectionToken<PlanningGateway>("faculator.planning-gateway");
export const CALCULATION_GATEWAY = new InjectionToken<CalculationGateway>("faculator.calculation-gateway");
export const RECIPE_GATEWAY = new InjectionToken<RecipeGateway>("faculator.recipe-gateway");
export const PROCESS_CONFIGURATION_GATEWAY = new InjectionToken<ProcessConfigurationGateway>("faculator.process-configuration-gateway");
