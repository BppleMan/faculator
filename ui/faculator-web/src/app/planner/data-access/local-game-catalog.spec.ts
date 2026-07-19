import { TestBed } from "@angular/core/testing";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocalGameCatalog } from "./local-game-catalog";

describe("LocalGameCatalog", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("maps untrusted export JSON into stable DTOs and caches the boundary result", async () => {
        const gameData = {
            game: { factorio_version: "2.0.76", exporter_version: "0.1.0" },
            item_groups: [{ name: "logistics", order: "a", subgroups: [{ name: "belt", order: "a" }] }],
            items: [{ name: "transport-belt", group: "logistics", subgroup: "belt", order: "a", stack_size: 100 }],
            fluids: [],
            recipes: [{ name: "transport-belt", group: "logistics", subgroup: "belt", order: "a", category: "crafting", energy: 0.5, ingredients: [{ type: "item", name: "iron-plate", amount: 1 }], products: [{ type: "item", name: "transport-belt", amount: 2, probability: 0.5 }] }],
            entities: [{ name: "assembling-machine-1", order: "a", crafting_speed: 0.5, crafting_categories: ["crafting"], module_inventory_size: 0 }],
            qualities: [{ name: "normal", order: "a", level: 0 }]
        };
        const responses = [gameData, { "item:transport-belt": "基础传送带" }, { "item:transport-belt": "Transport belt" }];
        const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify(responses.shift()), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        const service = TestBed.inject(LocalGameCatalog);

        const first = await service.load();
        const second = await service.load();

        expect(first.value?.factorioVersion).toBe("2.0.76");
        expect(first.value?.recipes[0]?.products[0]?.amount).toBe(1);
        expect(first.value?.translations.get("zh-CN")?.get("item:transport-belt")).toBe("基础传送带");
        expect(second.value).toBe(first.value);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });
});
