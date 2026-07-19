import { Component, computed, input, output, signal } from "@angular/core";

import { GameIcon } from "../../../components/shared/game-icon/game-icon";
import { ModuleDto, ModuleSelectionDto, QualityDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";

type ModuleCategory = "speed" | "productivity" | "quality" | "efficiency";

@Component({
    selector: "app-module-picker",
    imports: [GameIcon],
    templateUrl: "./module-picker.html",
    styleUrl: "./module-picker.scss"
})
export class ModulePicker {
    protected readonly categories: ReadonlyArray<ModuleCategory> = ["speed", "productivity", "quality", "efficiency"];
    public readonly owner = input.required<"machine" | "beacon">();
    public readonly slotIndex = input.required<number>();
    public readonly modules = input.required<ReadonlyArray<ModuleDto>>();
    public readonly qualities = input.required<ReadonlyArray<QualityDto>>();
    public readonly selection = input<ModuleSelectionDto | null>(null);
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly chosen = output<ModuleSelectionDto | null>();
    public readonly closed = output<void>();
    protected readonly category = signal<ModuleCategory>("speed");
    protected readonly availableCategories = computed(() => this.categories.filter(category => this.modules().some(module => this.categoryOf(module) === category)));
    protected readonly categoryModules = computed(() => this.modules().filter(module => this.categoryOf(module) === this.resolvedCategory()));

    protected resolvedCategory(): ModuleCategory {
        return this.availableCategories().includes(this.category()) ? this.category() : this.availableCategories()[0] ?? "speed";
    }

    protected isActive(module: ModuleDto, quality: QualityDto): boolean {
        return this.selection()?.moduleName === module.name && this.selection()?.qualityName === quality.name;
    }

    protected slotLabel(): string {
        return this.owner() === "machine"
            ? (this.locale() === Locale.Chinese ? "机器插件槽" : "Machine module slot")
            : (this.locale() === Locale.Chinese ? "插件塔槽" : "Beacon module slot");
    }

    protected categoryLabel(category: ModuleCategory): string {
        if (this.locale() !== Locale.Chinese) return category.toUpperCase();
        return { speed: "速度", productivity: "产能", quality: "品质", efficiency: "节能" }[category];
    }

    protected categoryIcon(category: ModuleCategory): string {
        return `${category === "efficiency" ? "efficiency" : category}-module`;
    }

    protected tierLabel(index: number): string {
        return ["I", "II", "III"][index] ?? String(index + 1);
    }

    private categoryOf(module: ModuleDto): ModuleCategory {
        const effects = [
            { key: "speed" as const, value: module.speed },
            { key: "productivity" as const, value: module.productivity },
            { key: "quality" as const, value: module.quality },
            { key: "efficiency" as const, value: Math.max(0, -module.consumption) }
        ];
        return effects.reduce((best, effect) => effect.value > best.value ? effect : best).key;
    }
}
