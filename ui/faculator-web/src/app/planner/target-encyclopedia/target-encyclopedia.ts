import { AfterViewInit, Component, ElementRef, computed, inject, input, output, signal, viewChild } from "@angular/core";

import { GameIcon } from "../../components/shared/game-icon/game-icon";
import { RECIPE_GATEWAY } from "../../core/faculator-api/contracts/gateway-tokens";
import {
    GameCatalogDto,
    RecipeDto,
    TargetCatalogDto,
    TargetCatalogEntryDto,
    TargetSelectionDto
} from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { TargetSelectionDetail } from "./target-selection-detail/target-selection-detail";

@Component({
    selector: "app-target-encyclopedia",
    imports: [GameIcon, TargetSelectionDetail],
    templateUrl: "./target-encyclopedia.html",
    styleUrl: "./target-encyclopedia.scss"
})
export class TargetEncyclopedia implements AfterViewInit {
    private readonly recipeGateway = inject(RECIPE_GATEWAY);
    private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>("searchInput");
    public readonly targetCatalog = input.required<TargetCatalogDto>();
    public readonly gameCatalog = input.required<GameCatalogDto>();
    public readonly locale = input.required<Locale>();
    public readonly createLine = input.required<boolean>();
    public readonly confirmed = output<TargetSelectionDto>();
    public readonly closed = output<void>();
    protected readonly activeGroupName = signal("");
    protected readonly activeSubgroupName = signal("");
    protected readonly query = signal("");
    protected readonly selectedEntry = signal<TargetCatalogEntryDto | null>(null);
    protected readonly recipes = signal<ReadonlyArray<RecipeDto>>([]);
    protected readonly selectedRecipe = signal<RecipeDto | null>(null);
    protected readonly minimum = signal(60);
    protected readonly activeGroup = computed(() => {
        const groups = this.targetCatalog().groups;
        return groups.find((group) => group.name === this.activeGroupName()) ?? groups[0] ?? null;
    });
    protected readonly subgroups = computed(() => {
        const group = this.activeGroup();
        if (!group) return [];
        const populated = new Set(this.targetCatalog().entries.filter(entry => entry.group === group.name).map(entry => entry.subgroup));
        return group.subgroups.filter(subgroup => populated.has(subgroup.name));
    });
    protected readonly entries = computed(() => {
        const group = this.activeGroup();
        if (!group) return [];
        const allowedSubgroups = new Set(group.subgroups.map((subgroup) => subgroup.name));
        const query = this.query().trim().toLocaleLowerCase();
        return this.targetCatalog().entries.filter((entry) => allowedSubgroups.has(entry.subgroup)
            && (!this.activeSubgroupName() || entry.subgroup === this.activeSubgroupName())
            && (!query || this.matchesQuery(entry, query)));
    });

    public ngAfterViewInit(): void {
        queueMicrotask(() => this.searchInput().nativeElement.focus());
    }

    protected switchGroup(name: string): void {
        this.activeGroupName.set(name);
        this.activeSubgroupName.set("");
        this.selectedEntry.set(null);
        this.recipes.set([]);
        this.selectedRecipe.set(null);
    }

    protected groupCount(groupName: string): number {
        const query = this.query().trim().toLocaleLowerCase();
        return this.targetCatalog().entries.filter((entry) => entry.group === groupName && (!query || this.matchesQuery(entry, query))).length;
    }

    protected updateQuery(event: Event): void {
        this.query.set((event.target as HTMLInputElement).value);
    }

    protected updateMinimum(event: Event): void {
        this.minimum.set(Math.max(0, Number((event.target as HTMLInputElement).value) || 0));
    }

    protected async selectEntry(entry: TargetCatalogEntryDto): Promise<void> {
        this.selectedEntry.set(entry);
        const result = await this.recipeGateway.findProducers(entry);
        const recipes = result.value ?? [];
        this.recipes.set(recipes);
        this.selectedRecipe.set(recipes[0] ?? null);
    }

    protected confirm(): void {
        const material = this.selectedEntry();
        const recipe = this.selectedRecipe();
        if (!material || !recipe || this.minimum() <= 0) return;
        this.confirmed.emit(new TargetSelectionDto(material, recipe, this.minimum(), this.createLine()));
    }

    protected name(type: string, name: string): string {
        return this.gameCatalog().translations.get(this.locale())?.get(`${type}:${name}`) ?? name.replaceAll("-", " ");
    }

    private matchesQuery(entry: TargetCatalogEntryDto, query: string): boolean {
        const recipes = this.gameCatalog().recipes.filter(recipe => recipe.products.some(product => product.key === entry.key));
        return [entry.name, this.name(entry.type, entry.name), entry.group, entry.subgroup,
            ...recipes.flatMap(recipe => [recipe.name, this.name("recipe", recipe.name)])]
            .join(" ").toLocaleLowerCase().includes(query);
    }

    protected readonly displayName = (type: string, name: string): string => this.name(type, name);
}
