import { TestBed } from "@angular/core/testing";
import { CatalogMaterialDto, RecipeDto, TargetSelectionDto } from "../../core/faculator-api/models/faculator-dtos";
import { LocalPlanning } from "./local-planning";

describe("LocalPlanning", () => {
    let service: LocalPlanning;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(LocalPlanning);
    });

    it("enforces at least one plan and one block", async () => {
        const initial = (await service.createInitial()).value!;
        expect((await service.closePlan(initial, initial.activePlanId)).error?.code).toBe("last-plan");
        expect((await service.deleteBlock(initial, initial.activeBlockId)).error?.code).toBe("last-block");
    });

    it("creates an independent line", async () => {
        const initial = (await service.createInitial()).value!;
        const material = new CatalogMaterialDto("item", "transport-belt", "logistics", "belt", "a", false, 100);
        const recipe = new RecipeDto("transport-belt", "logistics", "belt", "a", "crafting", 0.5, [], [], material, false, 3);
        const next = (await service.applyTarget(initial, new TargetSelectionDto(material, recipe, 60, true))).value!;
        const block = next.plans[0].blocks[0];
        expect(block.lines).toHaveLength(2);
        expect(block.lines[1].targets[0].minimum).toBe(60);
        expect(initial.plans[0].blocks[0].lines).toHaveLength(1);
    });

    it("restores class and map backed state after a refresh", async () => {
        const configured = await configuredSnapshot(service);
        await service.save(configured);
        const restored = (await TestBed.inject(LocalPlanning).createInitial()).value!;
        const line = restored.plans[0].blocks[0].lines[0];
        expect(restored.activeLineId).toBe(configured.activeLineId);
        expect(line.targets[0].key).toBe("item:transport-belt");
        expect(line.title.value("en")).toBe("transport-belt line");
        expect(line.recipeChoices).toBeInstanceOf(Map);
    });

    it("keeps edited targets pending until apply", async () => {
        const configured = await configuredSnapshot(service);
        const lineId = configured.activeLineId;
        const edited = (await service.updateTargetRate(configured, lineId, 0, 120)).value!;
        const editedLine = edited.plans[0].blocks[0].lines[0];
        expect(editedLine.targets[0].minimum).toBe(120);
        expect(editedLine.appliedTargets[0].minimum).toBe(60);
        expect(editedLine.dirty).toBe(true);

        const applied = (await service.applyTargets(edited, lineId)).value!;
        const appliedLine = applied.plans[0].blocks[0].lines[0];
        expect(appliedLine.appliedTargets[0].minimum).toBe(120);
        expect(appliedLine.dirty).toBe(false);
    });

    it("promotes an existing output into a separate line", async () => {
        const configured = await configuredSnapshot(service);
        const promoted = (await service.promoteOutput(configured, configured.activeLineId, new CatalogMaterialDto(
            "item", "iron-gear-wheel", "intermediate-products", "intermediate-product", "a", false, 100
        ))).value!;
        const block = promoted.plans[0].blocks[0];
        expect(block.lines).toHaveLength(2);
        expect(block.lines[1].targets[0].name).toBe("iron-gear-wheel");
        expect(promoted.activeLineId).toBe(block.lines[1].id);
    });

    it("toggles a declared boundary output without mutating calculation inputs", async () => {
        const configured = await configuredSnapshot(service);
        const lineId = configured.activeLineId;
        const declared = (await service.toggleExport(configured, lineId, "petroleum-gas")).value!;
        expect(declared.plans[0].blocks[0].lines[0].exportedOutputs).toEqual(["petroleum-gas"]);
        expect(declared.plans[0].blocks[0].lines[0].dirty).toBe(false);

        const removed = (await service.toggleExport(declared, lineId, "petroleum-gas")).value!;
        expect(removed.plans[0].blocks[0].lines[0].exportedOutputs).toEqual([]);
    });
});

async function configuredSnapshot(service: LocalPlanning) {
    const initial = (await service.createInitial()).value!;
    const material = new CatalogMaterialDto("item", "transport-belt", "logistics", "belt", "a", false, 100);
    const recipe = new RecipeDto("transport-belt", "logistics", "belt", "a", "crafting", 0.5, [], [], material, false, 3);
    return (await service.applyTarget(initial, new TargetSelectionDto(material, recipe, 60, false))).value!;
}
