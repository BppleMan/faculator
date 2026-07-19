import { Component, computed, input } from "@angular/core";

@Component({
    selector: "app-transport-tile",
    templateUrl: "./transport-tile.html",
    styleUrl: "./transport-tile.scss",
    host: {
        "data-component": "TransportTile",
        "[attr.data-transport-owner]": "ownerId()",
        "[attr.data-transport-type]": "transportType()",
        "[attr.data-grid-x]": "gridX()",
        "[attr.data-grid-y]": "gridY()",
        "[attr.data-tile-mask]": "mask()",
        "[attr.data-tile-shape]": "shape()",
        "[attr.data-tile-directions]": "directions()",
        "[style.background-position]": "backgroundPosition()"
    }
})
export class TransportTile {
    public readonly ownerId = input.required<string>();
    public readonly transportType = input("belt");
    public readonly gridX = input.required<number>();
    public readonly gridY = input.required<number>();
    public readonly mask = input.required<number>();
    protected readonly shape = computed(() => {
        const connections = [1, 2, 4, 8].filter((direction) => (this.mask() & direction) !== 0).length;
        if (connections === 0) return "single";
        if (connections === 1) return "endpoint";
        if (connections === 3) return "tee";
        if (connections === 4) return "cross";
        return this.mask() === 5 || this.mask() === 10 ? "straight" : "corner";
    });
    protected readonly directions = computed(() => [
        (this.mask() & 1) !== 0 ? "N" : "",
        (this.mask() & 2) !== 0 ? "E" : "",
        (this.mask() & 4) !== 0 ? "S" : "",
        (this.mask() & 8) !== 0 ? "W" : ""
    ].join(""));
    protected readonly backgroundPosition = computed(() => `${-(this.mask() % 4) * 40}px ${-Math.floor(this.mask() / 4) * 40}px`);
}
