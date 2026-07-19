import { TestBed } from "@angular/core/testing";

import { TransportTile } from "./transport-tile";

describe("TransportTile", () => {
    it("exposes stable topology diagnostics on the host element", async () => {
        const fixture = TestBed.createComponent(TransportTile);
        fixture.componentRef.setInput("ownerId", "line-a:process-a");
        fixture.componentRef.setInput("gridX", 7);
        fixture.componentRef.setInput("gridY", 3);
        fixture.componentRef.setInput("mask", 14);

        await fixture.whenStable();

        const host = fixture.nativeElement as HTMLElement;
        expect(host.dataset["component"]).toBe("TransportTile");
        expect(host.dataset["transportOwner"]).toBe("line-a:process-a");
        expect(host.dataset["gridX"]).toBe("7");
        expect(host.dataset["gridY"]).toBe("3");
        expect(host.dataset["tileMask"]).toBe("14");
        expect(host.dataset["tileShape"]).toBe("tee");
        expect(host.dataset["tileDirections"]).toBe("ESW");
    });
});
