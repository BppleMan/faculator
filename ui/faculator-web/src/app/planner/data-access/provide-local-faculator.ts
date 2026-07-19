import { Provider } from "@angular/core";

import {
    CALCULATION_GATEWAY,
    GAME_CATALOG_GATEWAY,
    PLANNING_GATEWAY,
    PROCESS_CONFIGURATION_GATEWAY,
    RECIPE_GATEWAY
} from "../../core/faculator-api/contracts/gateway-tokens";
import { LocalCalculation } from "./local-calculation";
import { LocalGameCatalog } from "./local-game-catalog";
import { LocalPlanning } from "./local-planning";
import { LocalProcessConfiguration } from "./local-process-configuration";
import { LocalRecipe } from "./local-recipe";

export function provideLocalFaculator(): Provider[] {
    return [
        LocalGameCatalog,
        LocalPlanning,
        LocalCalculation,
        LocalRecipe,
        LocalProcessConfiguration,
        { provide: GAME_CATALOG_GATEWAY, useExisting: LocalGameCatalog },
        { provide: PLANNING_GATEWAY, useExisting: LocalPlanning },
        { provide: CALCULATION_GATEWAY, useExisting: LocalCalculation },
        { provide: RECIPE_GATEWAY, useExisting: LocalRecipe },
        { provide: PROCESS_CONFIGURATION_GATEWAY, useExisting: LocalProcessConfiguration }
    ];
}
