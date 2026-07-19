import { Component, computed, input } from "@angular/core";

@Component({
    selector: "app-game-icon",
    templateUrl: "./game-icon.html",
    styleUrl: "./game-icon.scss",
    host: {
        "[style.--game-icon-size.px]": "size()"
    }
})
export class GameIcon {
    public readonly type = input.required<string>();
    public readonly name = input.required<string>();
    public readonly size = input(32);
    protected readonly source = computed(() => `/icons/${this.type().replaceAll("_", "-")}/${this.name()}.png`);
}
