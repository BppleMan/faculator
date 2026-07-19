import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import {
    BlockObservationDto,
    BomNodeDto,
    CalculationResultDto,
    GameCatalogDto,
    LocalizedTextDto,
    MachineDto,
    MaterialDto,
    ProcessConfigurationDto,
    ProcessDto,
    ProductionLineDto,
    RecipeDto,
    TargetDto
} from "../../core/faculator-api/models/faculator-dtos";
import { CalculationStatus } from "../../core/faculator-api/models/calculation-status";
import { Locale } from "../../core/faculator-api/models/locale";
import { FinderColumns } from "./finder-columns/finder-columns";
import { MaterialRail } from "./material-rail/material-rail";
import { DependencyRings } from "./dependency-rings/dependency-rings";
import { WorkloadSankey } from "./workload-sankey/workload-sankey";

describe("observation view interactions", () => {
    it("selects a configured material-rail target", async () => {
        const { observation, line } = fixtureData();
        const fixture = TestBed.createComponent(MaterialRail);
        fixture.componentRef.setInput("observations", [observation]);
        fixture.componentRef.setInput("catalog", catalog());
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("selectedProcessId", "");
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const selected = vi.fn();
        fixture.componentInstance.targetProcessSelected.subscribe(selected);
        await fixture.whenStable();

        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(".target-card")?.click();
        expect(selected).toHaveBeenCalledWith({ lineId: line.id, processId: observation.result.roots[0].processId });
    });

    it("selects an independent finder node and forwards its recipe replacement", async () => {
        const { observation, line, childProcess } = fixtureData();
        const fixture = TestBed.createComponent(FinderColumns);
        fixture.componentRef.setInput("observation", observation);
        fixture.componentRef.setInput("observations", [observation]);
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const selected = vi.fn();
        const replacement = vi.fn();
        fixture.componentInstance.processSelected.subscribe(selected);
        fixture.componentInstance.replacementRequested.subscribe(replacement);
        await fixture.whenStable();

        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(".material-row")[1].click();
        await fixture.whenStable();
        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(".replace-recipe")?.click();
        expect(selected).toHaveBeenCalledWith(childProcess.id);
        expect(replacement).toHaveBeenCalledWith(childProcess);
    });

    it("selects a Sankey node and forwards its replacement action", async () => {
        const { observation, line, rootProcess } = fixtureData();
        const fixture = TestBed.createComponent(WorkloadSankey);
        fixture.componentRef.setInput("observations", [observation]);
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const lineSelected = vi.fn();
        const processSelected = vi.fn();
        const replacement = vi.fn();
        fixture.componentInstance.lineSelected.subscribe(lineSelected);
        fixture.componentInstance.processSelected.subscribe(processSelected);
        fixture.componentInstance.replacementRequested.subscribe(replacement);
        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        root.querySelector<HTMLButtonElement>(".line-selector")?.click();
        root.querySelector<HTMLButtonElement>(".node")?.click();
        await fixture.whenStable();
        root.querySelector<HTMLButtonElement>(".recipe-action")?.click();
        expect(lineSelected).toHaveBeenCalledWith(line.id);
        expect(processSelected).toHaveBeenCalledWith(rootProcess.id);
        expect(replacement).toHaveBeenCalledWith(rootProcess);
    });

    it("switches between independent dependency-ring roots for a multi-target line", async () => {
        const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
        const { observation, line } = fixtureData();
        const secondRoot = new BomNodeDto(
            "node-second-root",
            "target-1",
            new MaterialDto("item", "processing-unit", 30),
            30,
            false,
            null,
            []
        );
        const multiRootObservation = new BlockObservationDto(
            line,
            new CalculationResultDto(
                line.id,
                observation.result.status,
                observation.result.objective,
                [...observation.result.roots, secondRoot],
                observation.result.processes,
                observation.result.balances,
                observation.result.inputs,
                observation.result.matrix
            )
        );
        const fixture = TestBed.createComponent(DependencyRings);
        fixture.componentRef.setInput("observations", [multiRootObservation]);
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        const tabs = root.querySelectorAll<HTMLButtonElement>(".root-tabs button");
        expect(tabs).toHaveLength(2);
        tabs[1].click();
        fixture.detectChanges();
        expect(root.querySelector(".target-core strong")?.textContent).toContain("processing-unit");
        expect(tabs[1].getAttribute("aria-pressed")).toBe("true");
        context.mockRestore();
    });

    it("forwards the active dependency-ring inspector recipe replacement", async () => {
        const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
        const { observation, line, rootProcess } = fixtureData();
        const fixture = TestBed.createComponent(DependencyRings);
        fixture.componentRef.setInput("observations", [observation]);
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const replacement = vi.fn();
        fixture.componentInstance.replacementRequested.subscribe(replacement);
        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        root.querySelector<HTMLButtonElement>(".recipe button")?.click();
        expect(replacement).toHaveBeenCalledWith(rootProcess);
        context.mockRestore();
    });

    it("opens the target request path for an unconfigured dependency-ring line", async () => {
        const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
        const { line } = fixtureData();
        const draftLine = new ProductionLineDto(line.id, line.title, [], [], new Map(), new Map(), [], false);
        const draftObservation = new BlockObservationDto(
            draftLine,
            new CalculationResultDto(line.id, CalculationStatus.Feasible, "bom-expansion", [], [], [], [], [])
        );
        const fixture = TestBed.createComponent(DependencyRings);
        fixture.componentRef.setInput("observations", [draftObservation]);
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const targetRequested = vi.fn();
        fixture.componentInstance.targetRequested.subscribe(targetRequested);
        await fixture.whenStable();

        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(".ring-draft-panel button")?.click();
        expect(targetRequested).toHaveBeenCalledWith(line.id);
        context.mockRestore();
    });

    it("renders and selects every independent material-rail target root", async () => {
        const { observation, line } = fixtureData();
        const secondRoot = new BomNodeDto(
            "node-second-target",
            "target-1",
            new MaterialDto("item", "processing-unit", 30),
            30,
            false,
            "process-second-target",
            []
        );
        const multiTargetObservation = new BlockObservationDto(
            line,
            new CalculationResultDto(
                line.id,
                observation.result.status,
                observation.result.objective,
                [...observation.result.roots, secondRoot],
                observation.result.processes,
                observation.result.balances,
                observation.result.inputs,
                observation.result.matrix
            )
        );
        const fixture = TestBed.createComponent(MaterialRail);
        fixture.componentRef.setInput("observations", [multiTargetObservation]);
        fixture.componentRef.setInput("catalog", catalog());
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("selectedProcessId", "");
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const selected = vi.fn();
        fixture.componentInstance.targetProcessSelected.subscribe(selected);
        await fixture.whenStable();

        const cards = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(".target-card");
        expect(cards).toHaveLength(2);
        expect(cards[1].textContent).toContain("processing-unit");
        cards[1].click();
        expect(selected).toHaveBeenCalledWith({ lineId: line.id, processId: secondRoot.processId });
    });

    it("renders a clickable material-rail byproduct anchor for its supplying recipe", async () => {
        const target = new TargetDto("item", "utility-science-pack", 60);
        const targetMaterial = new MaterialDto("item", target.name, target.minimum);
        const byproduct = new MaterialDto("fluid", "petroleum-gas", 15);
        const machine = new MachineDto("assembling-machine-3", "a", 1, ["crafting"], 0);
        const recipe = new RecipeDto("utility-science-pack", "production", "science", "a", "crafting", 1, [], [targetMaterial, byproduct], targetMaterial, false, 0);
        const process = new ProcessDto("process-byproduct", "target-0", recipe, targetMaterial, 20, machine, [machine], 0, 0, 1, 1, 1, 0, 0, new ProcessConfigurationDto(machine.name));
        const root = new BomNodeDto("root-byproduct", "target-0", targetMaterial, target.minimum, false, process.id, []);
        const line = new ProductionLineDto("line", new LocalizedTextDto("黄瓶生产线", "Yellow science line"), [target], [target], new Map(), new Map(), [], false);
        const observation = new BlockObservationDto(line, new CalculationResultDto(line.id, CalculationStatus.Feasible, "bom-expansion", [root], [process], [], [], []));
        const fixture = TestBed.createComponent(MaterialRail);
        fixture.componentRef.setInput("observations", [observation]);
        fixture.componentRef.setInput("catalog", catalog());
        fixture.componentRef.setInput("activeLineId", line.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("selectedProcessId", "");
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const selected = vi.fn();
        fixture.componentInstance.targetProcessSelected.subscribe(selected);
        await fixture.whenStable();

        const output = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(".byproduct-card")!;
        expect(output.textContent).toContain("petroleum-gas");
        expect(output.textContent).toContain("300 / min");
        output.click();
        expect(selected).toHaveBeenCalledWith({ lineId: line.id, processId: process.id });
    });
});

function fixtureData() {
    const target = new TargetDto("item", "utility-science-pack", 60);
    const rootMaterial = new MaterialDto("item", "utility-science-pack", 60);
    const childMaterial = new MaterialDto("item", "iron-plate", 800);
    const machine = new MachineDto("assembling-machine-3", "a", 1, ["crafting"], 0);
    const rootRecipe = new RecipeDto("utility-science-pack", "production", "science", "a", "crafting", 1, [childMaterial], [rootMaterial], rootMaterial, false, 0);
    const childRecipe = new RecipeDto("iron-plate", "production", "plate", "b", "smelting", 1, [], [childMaterial], childMaterial, false, 0);
    const rootProcess = new ProcessDto("process-root", "root", rootRecipe, rootMaterial, 60, machine, [machine], 0, 0, 1, 1, 1, 0, 0, new ProcessConfigurationDto(machine.name));
    const childProcess = new ProcessDto("process-child", "root/0", childRecipe, childMaterial, 800, machine, [machine], 0, 0, 1, 1, 1, 0, 0, new ProcessConfigurationDto(machine.name));
    const child = new BomNodeDto("node-child", "root/0", childMaterial, 800, false, childProcess.id, []);
    const root = new BomNodeDto("node-root", "root", rootMaterial, 60, false, rootProcess.id, [child]);
    const line = new ProductionLineDto("line", new LocalizedTextDto("黄瓶生产线", "Yellow science line"), [target], [target], new Map(), new Map(), [], false);
    const result = new CalculationResultDto(line.id, CalculationStatus.Feasible, "bom-expansion", [root], [rootProcess, childProcess], [], [], []);
    return { line, observation: new BlockObservationDto(line, result), rootProcess, childProcess };
}

function catalog(): GameCatalogDto {
    return new GameCatalogDto("test", "test", [], [], [], [], [], [], new Map());
}
