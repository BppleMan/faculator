import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { CalculationStatus } from "../../core/faculator-api/models/calculation-status";
import {
    BlockObservationDto,
    BomNodeDto,
    CalculationResultDto,
    GameCatalogDto,
    LocalizedTextDto,
    MaterialDto,
    ProductionLineDto,
    TargetDto
} from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { ObservationView } from "../../core/faculator-api/models/observation-view";
import { ObservationWorkspace } from "./observation-workspace";

describe("ObservationWorkspace", () => {
    it("renders all four views from the same observation DTO", async () => {
        const fixture = TestBed.createComponent(ObservationWorkspace);
        const target = new TargetDto("item", "transport-belt", 60);
        const line = new ProductionLineDto(
            "line-a", new LocalizedTextDto("传送带", "Belt"), [target], [target], new Map(), new Map(), [], false
        );
        const result = new CalculationResultDto(
            line.id, CalculationStatus.Feasible, "bom-expansion", [], [], [], [], []
        );
        fixture.componentRef.setInput("observations", [new BlockObservationDto(line, result)]);
        fixture.componentRef.setInput("catalog", new GameCatalogDto("2.0.76", "test", [], [], [], [], [], [], new Map()));
        fixture.componentRef.setInput("activeLine", line);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        fixture.componentRef.setInput("selectedProcessId", "");

        const cases = [
            [ObservationView.MaterialRail, "block-view-rail"],
            [ObservationView.DependencyRings, "block-view-rings"],
            [ObservationView.FinderColumns, "block-view-finder"],
            [ObservationView.WorkloadSankey, "block-view-sankey"]
        ] as const;
        for (const [view, testId] of cases) {
            fixture.componentRef.setInput("view", view);
            await fixture.whenStable();
            const root = fixture.nativeElement as HTMLElement;
            expect(root.querySelector(`[data-testid="${testId}"]`)).not.toBeNull();
            if (view === ObservationView.WorkloadSankey) {
                const lineSelector = root.querySelector<HTMLButtonElement>(".line-selector");
                expect(lineSelector?.textContent).toContain("LINE 01");
                expect(lineSelector?.textContent).toContain("transport-belt · ≥ 60.00 / min");
                expect(lineSelector?.querySelector("app-game-icon")).not.toBeNull();
                expect(lineSelector?.querySelector(".line-state")?.classList.contains("is-ready")).toBe(true);
            }
        }
    });

    it("exposes icon-backed tabs with selected state and emits the requested view", async () => {
        const fixture = TestBed.createComponent(ObservationWorkspace);
        const line = new ProductionLineDto("line-a", new LocalizedTextDto("效能科技包", "Utility science pack"), [], [], new Map(), new Map(), [], false);
        const result = new CalculationResultDto(line.id, CalculationStatus.Feasible, "bom-expansion", [], [], [], [], []);
        fixture.componentRef.setInput("observations", [new BlockObservationDto(line, result)]);
        fixture.componentRef.setInput("catalog", new GameCatalogDto("2.0.76", "test", [], [], [], [], [], [], new Map()));
        fixture.componentRef.setInput("activeLine", line);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        fixture.componentRef.setInput("selectedProcessId", "");
        fixture.componentRef.setInput("view", ObservationView.MaterialRail);
        const changed = vi.fn();
        fixture.componentInstance.viewChanged.subscribe(changed);
        await fixture.whenStable();

        const tabs = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]')];
        const segmented = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="tablist"]');
        expect(segmented?.classList.contains("fac-segmented")).toBe(true);
        expect(tabs).toHaveLength(4);
        expect(tabs.every((tab) => !tab.classList.contains("fac-button"))).toBe(true);
        expect(tabs[0].getAttribute("aria-selected")).toBe("true");
        expect(tabs[0].classList.contains("is-active")).toBe(true);
        expect(tabs.map((tab) => tab.querySelector("img")?.getAttribute("src"))).toEqual([
            "/design-assets/ui/view-material-rail.svg",
            "/design-assets/ui/view-dependency-rings.svg",
            "/design-assets/ui/view-finder-columns.svg",
            "/design-assets/ui/view-flow-sankey.svg"
        ]);
        tabs[1].click();
        tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
        await fixture.whenStable();
        expect(changed).toHaveBeenCalledWith(ObservationView.DependencyRings);
        expect(changed).toHaveBeenCalledWith(ObservationView.WorkloadSankey);
    });

    it("keeps the block material rail visible when another line is configured", async () => {
        const fixture = TestBed.createComponent(ObservationWorkspace);
        const configuredTarget = new TargetDto("item", "utility-science-pack", 60);
        const configuredLine = new ProductionLineDto(
            "line-configured", new LocalizedTextDto("效能科技包", "Utility science pack"), [configuredTarget], [configuredTarget], new Map(), new Map(), [], false
        );
        const draftLine = new ProductionLineDto(
            "line-draft", new LocalizedTextDto("草稿生产线", "Draft line"), [], [], new Map(), new Map(), [], false
        );
        const bomRoot = new BomNodeDto(
            "root", "root", new MaterialDto("item", "utility-science-pack"), 60, false, null, [
                new BomNodeDto("child", "root/0", new MaterialDto("item", "iron-plate"), 800, true, null, [])
            ]
        );
        const configuredResult = new CalculationResultDto(configuredLine.id, CalculationStatus.Feasible, "bom-expansion", [bomRoot], [], [], [], []);
        const draftResult = new CalculationResultDto(draftLine.id, CalculationStatus.Feasible, "unconfigured", [], [], [], [], []);
        fixture.componentRef.setInput("observations", [
            new BlockObservationDto(configuredLine, configuredResult),
            new BlockObservationDto(draftLine, draftResult)
        ]);
        fixture.componentRef.setInput("catalog", new GameCatalogDto("2.0.76", "test", [], [], [], [], [], [], new Map()));
        fixture.componentRef.setInput("activeLine", draftLine);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        fixture.componentRef.setInput("selectedProcessId", "");
        fixture.componentRef.setInput("view", ObservationView.MaterialRail);

        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        expect(root.querySelector(".empty-state")).toBeNull();
        expect(root.querySelector("app-material-rail")).not.toBeNull();
        expect(root.querySelector(".summary")?.textContent).toContain("目标1");
        expect(root.querySelector(".summary")?.textContent).toContain("独立实例2");
        expect(root.querySelector(".summary")?.textContent).toContain("依赖层级2");
    });

    it("opens target selection for the active draft line from every observation view", async () => {
        const fixture = TestBed.createComponent(ObservationWorkspace);
        const configuredTarget = new TargetDto("item", "utility-science-pack", 60);
        const configuredLine = new ProductionLineDto("line-configured", new LocalizedTextDto("效能科技包", "Utility science pack"), [configuredTarget], [configuredTarget], new Map(), new Map(), [], false);
        const draftLine = new ProductionLineDto("line-draft", new LocalizedTextDto("草稿生产线", "Draft line"), [], [], new Map(), new Map(), [], false);
        fixture.componentRef.setInput("observations", [
            new BlockObservationDto(configuredLine, new CalculationResultDto(configuredLine.id, CalculationStatus.Feasible, "bom-expansion", [], [], [], [], [])),
            new BlockObservationDto(draftLine, new CalculationResultDto(draftLine.id, CalculationStatus.Feasible, "unconfigured", [], [], [], [], []))
        ]);
        fixture.componentRef.setInput("catalog", new GameCatalogDto("2.0.76", "test", [], [], [], [], [], [], new Map()));
        fixture.componentRef.setInput("activeLine", draftLine);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        fixture.componentRef.setInput("selectedProcessId", "");
        const targetRequested = vi.fn();
        fixture.componentInstance.targetRequested.subscribe(targetRequested);

        const cases: ReadonlyArray<readonly [ObservationView, string]> = [
            [ObservationView.MaterialRail, ".rail-draft-card"],
            [ObservationView.DependencyRings, ".ring-draft-panel button"],
            [ObservationView.FinderColumns, ".draft-target button"],
            [ObservationView.WorkloadSankey, ".sankey-draft-panel button"]
        ];
        for (const [index, [view, selector]] of cases.entries()) {
            fixture.componentRef.setInput("view", view);
            await fixture.whenStable();
            const button = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(selector)].at(-1);
            expect(button).not.toBeNull();
            button?.click();
            expect(targetRequested).toHaveBeenNthCalledWith(index + 1, draftLine.id);
        }
    });
});
