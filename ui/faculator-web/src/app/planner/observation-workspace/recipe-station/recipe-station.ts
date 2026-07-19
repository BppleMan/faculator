import { Component, input, output, signal } from "@angular/core";

import { GameIcon } from "../../../components/shared/game-icon/game-icon";
import { GameCatalogDto, MachineDto, ModuleSelectionDto, ProcessConfigurationDto, ProcessDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";
import { ModulePicker } from "../module-picker/module-picker";

export interface ProcessConfigurationChange {
    readonly process: ProcessDto;
    readonly configuration: ProcessConfigurationDto;
}

@Component({
    selector: "app-recipe-station",
    imports: [GameIcon, ModulePicker],
    templateUrl: "./recipe-station.html",
    styleUrl: "./recipe-station.scss",
    host: {
        "[class.has-picker]": "slotPicker() !== null",
        "[style.z-index]": "slotPicker() !== null ? 40 : null"
    }
})
export class RecipeStation {
    public readonly process = input.required<ProcessDto>();
    public readonly catalog = input.required<GameCatalogDto>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly selected = input(false);
    public readonly processSelected = output<string>();
    public readonly replacementRequested = output<ProcessDto>();
    public readonly configurationChanged = output<ProcessConfigurationChange>();
    protected readonly slotPicker = signal<{ readonly owner: "machine" | "beacon"; readonly index: number } | null>(null);

    protected selectRecipe(): void {
        this.processSelected.emit(this.process().id);
        this.replacementRequested.emit(this.process());
    }

    protected selectMachine(machine: MachineDto): void {
        const current = this.process().configuration;
        this.emitConfiguration(new ProcessConfigurationDto(
            machine.name,
            this.resizeSlots(current.machineModuleSlots, machine.moduleSlots),
            current.beaconCount,
            this.resizeSlots(current.beaconModuleSlots, this.process().beaconSlots)
        ));
    }

    protected selectedMachine(): MachineDto | null {
        const name = this.process().configuration.machineName;
        return this.process().machineOptions.find(machine => machine.name === name) ?? this.process().machine;
    }

    protected slots(count: number): ReadonlyArray<number> {
        return Array.from({ length: count }, (_, index) => index);
    }

    protected selection(owner: "machine" | "beacon", index: number): ModuleSelectionDto | null {
        const configuration = this.process().configuration;
        return (owner === "machine" ? configuration.machineModuleSlots : configuration.beaconModuleSlots)[index] ?? null;
    }

    protected slotLabel(owner: "machine" | "beacon", index: number): string {
        const current = this.selection(owner, index);
        const ownerName = owner === "machine"
            ? (this.locale() === Locale.Chinese ? "机器插件槽" : "Machine module slot")
            : (this.locale() === Locale.Chinese ? "插件塔槽" : "Beacon module slot");
        return `${ownerName} ${index + 1} · ${current ? `${this.nameOf()("item", current.moduleName)} · ${this.nameOf()("quality", current.qualityName)}` : (this.locale() === Locale.Chinese ? "不装插件" : "No module")}`;
    }

    protected instanceCode(): string {
        const path = this.process().nodePath;
        return path ? path.replace(/^target-/, "T").replaceAll(".", "·") : this.process().id;
    }

    /**
     * Keeps dense process cards legible at both low and industrial-scale rates.
     * This is presentation-only; solver precision remains in the calculation result.
     */
    protected formatRate(value: number): string {
        if (!Number.isFinite(value)) return "—";
        if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        if (Math.abs(value) >= 100) return value.toFixed(0);
        if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
        return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }

    protected setBeaconCount(value: number): void {
        const current = this.process().configuration;
        this.emitConfiguration(new ProcessConfigurationDto(current.machineName, current.machineModuleSlots, Math.max(0, Math.min(64, Math.floor(value || 0))), current.beaconModuleSlots));
    }

    protected setBeaconCountFromInput(event: Event): void {
        this.setBeaconCount(Number((event.target as HTMLInputElement).value));
    }

    protected chooseModule(selection: ModuleSelectionDto | null): void {
        const picker = this.slotPicker();
        if (!picker) return;
        const current = this.process().configuration;
        const machineSlots = [...current.machineModuleSlots];
        const beaconSlots = [...current.beaconModuleSlots];
        (picker.owner === "machine" ? machineSlots : beaconSlots)[picker.index] = selection;
        this.emitConfiguration(new ProcessConfigurationDto(current.machineName, machineSlots, current.beaconCount, beaconSlots));
        this.slotPicker.set(null);
    }

    private resizeSlots(slots: ReadonlyArray<ModuleSelectionDto | null>, count: number): ReadonlyArray<ModuleSelectionDto | null> {
        return Array.from({ length: count }, (_, index) => slots[index] ?? null);
    }

    private emitConfiguration(configuration: ProcessConfigurationDto): void {
        this.configurationChanged.emit({ process: this.process(), configuration });
    }
}
