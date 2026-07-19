import { TestBed } from "@angular/core/testing";

import { RecipeGateway } from "../../core/faculator-api/contracts/recipe-gateway";
import { RECIPE_GATEWAY } from "../../core/faculator-api/contracts/gateway-tokens";
import {
    CatalogMaterialDto,
    GameCatalogDto,
    GatewayResultDto,
    ItemGroupDto,
    ItemSubgroupDto,
    MaterialDto,
    PlanningSnapshotDto,
    RecipeDto,
    RecipeReplacementDto,
    TargetCatalogDto,
    TargetCatalogEntryDto
} from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { TargetEncyclopedia } from "./target-encyclopedia";

describe("TargetEncyclopedia", () => {
    it("selects a searchable catalog entry and emits the chosen recipe and rate", async () => {
        const material = new CatalogMaterialDto("item", "transport-belt", "logistics", "belt", "a", false, 100);
        const recipe = new RecipeDto(
            "transport-belt", "logistics", "belt", "a", "crafting", 0.5, [], [new MaterialDto("item", "transport-belt", 2)], material, false, 3
        );
        const group = new ItemGroupDto("logistics", "a", [new ItemSubgroupDto("belt", "a")]);
        const targetCatalog = new TargetCatalogDto([group], [new TargetCatalogEntryDto(material, 1)]);
        const translations = new Map([["zh-CN", new Map([["item:transport-belt", "基础传送带"], ["item-group:logistics", "物流"]])]]);
        const gameCatalog = new GameCatalogDto("2.0.76", "test", [group], [material], [recipe], [], [], [], translations);
        TestBed.configureTestingModule({ providers: [{ provide: RECIPE_GATEWAY, useValue: new TargetRecipeGateway(targetCatalog, recipe) }] });
        const fixture = TestBed.createComponent(TargetEncyclopedia);
        fixture.componentRef.setInput("targetCatalog", targetCatalog);
        fixture.componentRef.setInput("gameCatalog", gameCatalog);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("createLine", true);
        const confirmed = vi.fn();
        fixture.componentInstance.confirmed.subscribe(confirmed);
        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        (root.querySelector(".entry-grid button") as HTMLButtonElement).click();
        await fixture.whenStable();
        const rate = root.querySelector("input[type=number]") as HTMLInputElement;
        rate.value = "120";
        rate.dispatchEvent(new Event("input"));
        await fixture.whenStable();
        (root.querySelector("button.confirm") as HTMLButtonElement).click();

        expect(confirmed).toHaveBeenCalledOnce();
        expect(confirmed.mock.calls[0][0].material.name).toBe("transport-belt");
        expect(confirmed.mock.calls[0][0].recipe.name).toBe("transport-belt");
        expect(confirmed.mock.calls[0][0].minimum).toBe(120);
        expect(confirmed.mock.calls[0][0].createLine).toBe(true);
    });

    it("focuses search and filters both group counters and the active group", async () => {
        const belt = new CatalogMaterialDto("item", "transport-belt", "logistics", "belt", "a", false, 100);
        const science = new CatalogMaterialDto("item", "utility-science-pack", "intermediate-products", "science-pack", "a", false, 200);
        const logistics = new ItemGroupDto("logistics", "a", [new ItemSubgroupDto("belt", "a")]);
        const intermediate = new ItemGroupDto("intermediate-products", "b", [new ItemSubgroupDto("science-pack", "a")]);
        const targetCatalog = new TargetCatalogDto([
            logistics,
            intermediate
        ], [
            new TargetCatalogEntryDto(belt, 1),
            new TargetCatalogEntryDto(science, 1)
        ]);
        const translations = new Map([[
            "zh-CN",
            new Map([
                ["item:transport-belt", "基础传送带"],
                ["item:utility-science-pack", "效能科技包（黄瓶）"],
                ["item-group:logistics", "物流"],
                ["item-group:intermediate-products", "中间产品"]
            ])
        ]]);
        const gameCatalog = new GameCatalogDto("2.0.76", "test", [logistics, intermediate], [belt, science], [], [], [], [], translations);
        TestBed.configureTestingModule({ providers: [{ provide: RECIPE_GATEWAY, useValue: new TargetRecipeGateway(targetCatalog) }] });
        const fixture = TestBed.createComponent(TargetEncyclopedia);
        fixture.componentRef.setInput("targetCatalog", targetCatalog);
        fixture.componentRef.setInput("gameCatalog", gameCatalog);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("createLine", true);
        await fixture.whenStable();
        await new Promise<void>((resolve) => queueMicrotask(resolve));

        const root = fixture.nativeElement as HTMLElement;
        const search = root.querySelector<HTMLInputElement>("input[type=search]")!;
        expect(document.activeElement).toBe(search);

        search.value = "效能科技包";
        search.dispatchEvent(new Event("input"));
        await fixture.whenStable();

        const counters = [...root.querySelectorAll<HTMLElement>("nav button > em")].map((counter) => counter.textContent?.trim());
        expect(counters).toEqual(["0", "1"]);
        expect(root.querySelector(".entry-grid-empty")?.textContent).toContain("当前分类没有匹配项目");
    });
});

class TargetRecipeGateway implements RecipeGateway {
    public constructor(private readonly targetCatalog: TargetCatalogDto, private readonly recipe?: RecipeDto) {}

    public async getTargetCatalog(): Promise<GatewayResultDto<TargetCatalogDto>> {
        return GatewayResultDto.success(this.targetCatalog);
    }

    public async findProducers(_material: MaterialDto): Promise<GatewayResultDto<ReadonlyArray<RecipeDto>>> {
        return GatewayResultDto.success(this.recipe ? [this.recipe] : []);
    }

    public async replaceRecipe(
        _snapshot: PlanningSnapshotDto,
        _request: RecipeReplacementDto,
        _recipeName: string
    ): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        return GatewayResultDto.failure("not-used", "Not used by this focused component test.");
    }
}
