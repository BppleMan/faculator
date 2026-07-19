import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { LocalizedTextDto, ProductionBlockDto, ProductionLineDto, ProductionPlanDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { BlockSidebar } from "./block-sidebar";

describe("BlockSidebar", () => {
    it("selects, creates and deletes blocks while preserving visible status and the last-block guard", async () => {
        const ready = new ProductionLineDto("line-ready", new LocalizedTextDto("就绪", "Ready"), [], [], new Map(), new Map(), [], false);
        const pending = new ProductionLineDto("line-pending", new LocalizedTextDto("待应用", "Pending"), [], [], new Map(), new Map(), [], true);
        const primary = new ProductionBlockDto("block-a", new LocalizedTextDto("生产区块 01", "Block 01"), [ready]);
        const secondary = new ProductionBlockDto("block-b", new LocalizedTextDto("生产区块 02", "Block 02"), [pending]);
        const plan = new ProductionPlanDto("plan", new LocalizedTextDto("基地规划", "Base plan"), [primary, secondary]);
        const fixture = TestBed.createComponent(BlockSidebar);
        fixture.componentRef.setInput("plan", plan);
        fixture.componentRef.setInput("activeBlockId", primary.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        const selected = vi.fn();
        const added = vi.fn();
        const deleted = vi.fn();
        fixture.componentInstance.blockSelected.subscribe(selected);
        fixture.componentInstance.blockAdded.subscribe(added);
        fixture.componentInstance.blockDeleted.subscribe(deleted);
        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        const cards = [...root.querySelectorAll<HTMLElement>(".block-list article")];
        expect(cards[0].classList.contains("is-active")).toBe(true);
        expect(cards[0].querySelector("i")?.className).toBe("is-draft");
        expect(cards[1].querySelector("i")?.className).toBe("is-pending");
        root.querySelectorAll<HTMLButtonElement>(".block-select")[1].click();
        root.querySelector<HTMLButtonElement>("header button")?.click();
        root.querySelectorAll<HTMLButtonElement>(".block-delete")[0].click();
        expect(selected).toHaveBeenCalledWith(secondary.id);
        expect(added).toHaveBeenCalledOnce();
        expect(deleted).toHaveBeenCalledWith(primary.id);

        fixture.componentRef.setInput("plan", new ProductionPlanDto(plan.id, plan.name, [primary]));
        await fixture.whenStable();
        expect(root.querySelector<HTMLButtonElement>(".block-delete")?.disabled).toBe(true);
    });
});
