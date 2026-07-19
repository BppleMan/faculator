import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import rawGameData from "../../../../../../assets/exported/game-data.json";

import {
    CatalogMaterialDto,
    BomNodeDto,
    GameCatalogDto,
    LocalizedTextDto,
    MachineDto,
    MaterialDto,
    ModuleDto,
    ModuleSelectionDto,
    ProcessConfigurationDto,
    ProductionLineDto,
    QualityDto,
    RecipeDto,
    TargetDto
} from "../../core/faculator-api/models/faculator-dtos";
import { LocalCalculation } from "./local-calculation";
import { LocalGameCatalog } from "./local-game-catalog";

describe("LocalCalculation", () => {
    let service: LocalCalculation;
    let catalogAdapter: { catalog: GameCatalogDto };

    beforeEach(() => {
        const ironPlate = new CatalogMaterialDto("item", "iron-plate", "intermediate", "plate", "a", false, 100);
        const gear = new CatalogMaterialDto("item", "iron-gear-wheel", "intermediate", "parts", "b", false, 100);
        const belt = new CatalogMaterialDto("item", "transport-belt", "logistics", "belt", "c", false, 100);
        const recipes = [
            new RecipeDto(
                "iron-gear-wheel", "intermediate", "parts", "a", "crafting", 0.5,
                [new MaterialDto("item", "iron-plate", 2)], [new MaterialDto("item", "iron-gear-wheel", 1)], gear, false, 3
            ),
            new RecipeDto(
                "transport-belt", "logistics", "belt", "b", "crafting", 0.5,
                [new MaterialDto("item", "iron-plate", 1), new MaterialDto("item", "iron-gear-wheel", 1)],
                [new MaterialDto("item", "transport-belt", 2)], belt, false, 3
            )
        ];
        const catalog = new GameCatalogDto(
            "2.0.76", "test", [], [ironPlate, gear, belt], recipes,
            [new MachineDto("assembling-machine-1", "a", 0.5, ["crafting"], 2)],
            [new ModuleDto("speed-module", "a", 0.2, 0, 0, 0.5)],
            [new QualityDto("rare", "c", 2)],
            new Map()
        );
        catalogAdapter = { catalog };
        TestBed.configureTestingModule({ providers: [{ provide: LocalGameCatalog, useValue: catalogAdapter }] });
        service = TestBed.inject(LocalCalculation);
    });

    it("keeps repeated material occurrences as independent BOM instances", async () => {
        const target = new TargetDto("item", "transport-belt", 60);
        const line = new ProductionLineDto(
            "line", new LocalizedTextDto("传送带", "Belt"), [target], [target],
            new Map([[target.key, "transport-belt"]]), new Map<string, ProcessConfigurationDto>(), [], false
        );
        const result = (await service.calculate(line)).value!;
        const ironPlateProcesses = result.processes.filter((process) => process.recipe.name === "iron-plate");
        const ironPlateBoundaries = flatten(result.roots).filter((node) => node.material.name === "iron-plate");

        expect(ironPlateProcesses).toHaveLength(0);
        expect(ironPlateBoundaries).toHaveLength(2);
        expect(new Set(ironPlateBoundaries.map((node) => node.nodePath)).size).toBe(2);
        expect(result.processes.map((process) => process.recipe.name)).toEqual(["transport-belt", "iron-gear-wheel"]);
        expect(result.matrix.length).toBeGreaterThan(0);
    });

    it("applies process-instance module quality effects inside the replaceable calculation adapter", async () => {
        const target = new TargetDto("item", "transport-belt", 60);
        const configuration = new ProcessConfigurationDto(
            "assembling-machine-1", [new ModuleSelectionDto("speed-module", "rare")], 0, []
        );
        const line = new ProductionLineDto(
            "line", new LocalizedTextDto("传送带", "Belt"), [target], [target],
            new Map([[target.key, "transport-belt"]]), new Map([["instance:target-0", configuration]]), [], false
        );

        const result = (await service.calculate(line)).value!;

        expect(result.processes[0].effectiveSpeed).toBeCloseTo(0.66, 5);
        expect(result.processes[0].speedMultiplier).toBeCloseTo(1.32, 5);
        expect(result.processes[0].exactMachines).toBeLessThan(0.5);
    });

    it("deprioritizes ignored-by-stats byproduct recipes when expanding a BOM node", async () => {
        const ironPlate = new CatalogMaterialDto("item", "iron-plate", "intermediate", "plate", "a", false, 100);
        const water = new CatalogMaterialDto("fluid", "water", "fluids", "fluid", "a", false, null);
        const standardRecipe = new RecipeDto(
            "iron-plate", "intermediate", "plate", "z", "crafting", 1,
            [new MaterialDto("fluid", "water", 1)], [new MaterialDto("item", "iron-plate", 1)], ironPlate, false, 0
        );
        const ignoredByproductRecipe = new RecipeDto(
            "metallic-asteroid-reprocessing", "intermediate", "plate", "a", "crafting", 1,
            [new MaterialDto("fluid", "water", 1)], [new MaterialDto("item", "iron-plate", 1, 1)], ironPlate, false, 0
        );
        catalogAdapter.catalog = new GameCatalogDto(
            "2.0.76", "test", [], [ironPlate, water], [standardRecipe, ignoredByproductRecipe], [], [], [], new Map()
        );
        const target = new TargetDto("item", "iron-plate", 60);
        const line = new ProductionLineDto(
            "line", new LocalizedTextDto("铁板", "Iron plate"), [target], [target], new Map(), new Map(), [], false
        );

        const result = (await service.calculate(line)).value!;

        expect(result.processes).toHaveLength(1);
        expect(result.processes[0].recipe.name).toBe("iron-plate");
    });

    it("matches the prototype yellow-science expansion without asteroid byproduct branches", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => rawGameData }));
        const catalogResult = await new LocalGameCatalog().load();
        vi.unstubAllGlobals();
        expect(catalogResult.succeeded).toBe(true);
        catalogAdapter.catalog = catalogResult.value!;
        const target = new TargetDto("item", "utility-science-pack", 60);
        const line = new ProductionLineDto(
            "yellow-science", new LocalizedTextDto("效能科技包（黄瓶）", "Utility science pack"), [target], [target],
            new Map([[target.key, "utility-science-pack"]]), new Map(), [], false
        );

        const result = (await service.calculate(line)).value!;

        expect(flatten(result.roots)).toHaveLength(92);
        expect(result.processes).toHaveLength(57);
        expect(result.processes[0].speedMultiplier).toBe(1);
        expect(result.processes[0].nodePath).toBe("target-0");
        expect(result.processes[0].depth).toBe(0);
        expect(result.processes.map((process) => process.recipe.name)).not.toContain("metallic-asteroid-reprocessing");
    });
});

function flatten(roots: ReadonlyArray<BomNodeDto>): ReadonlyArray<BomNodeDto> {
    return roots.flatMap((node) => [node, ...flatten(node.children)]);
}
