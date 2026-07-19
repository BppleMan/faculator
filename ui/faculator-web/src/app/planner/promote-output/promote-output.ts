import { Component, input, output } from "@angular/core";

import { GameIcon } from "../../components/shared/game-icon/game-icon";
import { MaterialDto, TargetDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";

@Component({
    selector: "app-promote-output",
    imports: [GameIcon],
    templateUrl: "./promote-output.html",
    styleUrl: "./promote-output.scss"
})
export class PromoteOutput {
    public readonly outputs = input.required<ReadonlyArray<MaterialDto>>();
    public readonly targets = input.required<ReadonlyArray<TargetDto>>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly selected = output<MaterialDto>();
    public readonly closed = output<void>();

    protected isLocked(material: MaterialDto): boolean {
        return this.targets().some((target) => target.key === material.key);
    }

    protected availableCount(): number {
        return this.outputs().filter((material) => !this.isLocked(material)).length;
    }
}
