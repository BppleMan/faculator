import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { CatalogMaterialDto, GameCatalogDto, ItemGroupDto, LocalizedTextDto, MaterialDto, PlanningSnapshotDto, ProductionBlockDto, ProductionLineDto, ProductionPlanDto, RecipeDto, RecipeReplacementDto } from "../../core/faculator-api/models/faculator-dtos";
import { LocalGameCatalog } from "./local-game-catalog";
import { LocalRecipe } from "./local-recipe";

describe("LocalRecipe", () => {
    it("exposes every visible target, orders the direct producer first, and replaces immutably", async () => {
        const belt = new CatalogMaterialDto("item", "transport-belt", "logistics", "belt", "a", false, 100);
        const orphan = new CatalogMaterialDto("item", "orphan", "logistics", "belt", "b", false, 100);
        const ingredient = new MaterialDto("item", "iron-plate", 1);
        const direct = new RecipeDto("transport-belt", "logistics", "belt", "a", "crafting", 0.5, [ingredient], [new MaterialDto("item", "transport-belt", 1)], belt, false, 0);
        const recycling = new RecipeDto("transport-belt-recycling", "logistics", "belt", "z", "recycling", 1, [ingredient], [new MaterialDto("item", "transport-belt", 1)], belt, false, 0);
        const catalog = new GameCatalogDto("2", "1", [new ItemGroupDto("logistics", "a", [])], [belt, orphan], [recycling, direct], [], [], [], new Map());
        TestBed.configureTestingModule({ providers: [{ provide: LocalGameCatalog, useValue: { catalog } }] });
        const service = TestBed.inject(LocalRecipe);

        const targets = await service.getTargetCatalog();
        const producers = await service.findProducers(belt);
        expect(targets.value?.entries.map(entry => entry.name)).toEqual(["transport-belt", "orphan"]);
        expect(targets.value?.entries[0]?.producerCount).toBe(2);
        expect(targets.value?.entries[1]?.producerCount).toBe(0);
        expect(producers.value?.map(recipe => recipe.name)).toEqual(["transport-belt", "transport-belt-recycling"]);

        const line = new ProductionLineDto("line", new LocalizedTextDto("线", "Line"), [], [], new Map(), new Map(), [], false);
        const snapshot = new PlanningSnapshotDto([new ProductionPlanDto("plan", new LocalizedTextDto("计划", "Plan"), [new ProductionBlockDto("block", new LocalizedTextDto("区块", "Block"), [line])])], "plan", "block", "line");
        const replaced = await service.replaceRecipe(snapshot, new RecipeReplacementDto("line", "choice", belt, direct.name, 60), recycling.name);
        const replacedLine = replaced.value?.plans[0]?.blocks[0]?.lines[0];
        expect(replacedLine?.recipeChoices.get("choice")).toBe("transport-belt-recycling");
        expect(replacedLine?.dirty).toBe(true);
        expect(line.recipeChoices.size).toBe(0);
    });
});
