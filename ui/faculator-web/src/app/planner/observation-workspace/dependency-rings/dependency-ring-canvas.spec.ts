import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { BomNodeDto, MaterialDto } from "../../../core/faculator-api/models/faculator-dtos";
import { DependencyRingCanvas } from "./dependency-ring-canvas";

describe("DependencyRingCanvas", () => {
    it("selects a ring instance through its keyboard control", async () => {
        const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
        const child = new BomNodeDto("child", "root/0", new MaterialDto("item", "iron-plate"), 800, false, "process-child", []);
        const root = new BomNodeDto("root", "root", new MaterialDto("item", "utility-science-pack"), 60, false, "process-root", [child]);
        const fixture = TestBed.createComponent(DependencyRingCanvas);
        fixture.componentRef.setInput("root", root);
        fixture.componentRef.setInput("processes", []);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const selected = vi.fn();
        fixture.componentInstance.nodeSelected.subscribe(selected);
        await fixture.whenStable();

        const canvas = (fixture.nativeElement as HTMLElement).querySelector<HTMLCanvasElement>("canvas")!;
        canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
        canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        expect(selected).toHaveBeenCalledWith(child);
        context.mockRestore();
    });
});
