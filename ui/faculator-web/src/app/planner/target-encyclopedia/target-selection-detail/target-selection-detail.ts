import { Component, input, output } from "@angular/core";

import { GameIcon } from "../../../components/shared/game-icon/game-icon";
import { RecipeDto, TargetCatalogEntryDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";

@Component({
    selector: "app-target-selection-detail",
    imports: [GameIcon],
    templateUrl: "./target-selection-detail.html",
    styleUrl: "./target-selection-detail.scss"
})
export class TargetSelectionDetail {
    public readonly entry = input.required<TargetCatalogEntryDto | null>();
    public readonly recipes = input.required<ReadonlyArray<RecipeDto>>();
    public readonly selectedRecipe = input.required<RecipeDto | null>();
    public readonly minimum = input.required<number>();
    public readonly createLine = input.required<boolean>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly minimumChanged = output<number>();
    public readonly confirmed = output<void>();

    protected updateMinimum(event: Event): void {
        this.minimumChanged.emit(Math.max(0, Number((event.target as HTMLInputElement).value) || 0));
    }
}
