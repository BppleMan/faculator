import { inject, Service } from "@angular/core";

import { RecipeGateway } from "../../core/faculator-api/contracts/recipe-gateway";
import {
    GatewayResultDto,
    MaterialDto,
    PlanningSnapshotDto,
    ProductionBlockDto,
    ProductionLineDto,
    ProductionPlanDto,
    RecipeDto,
    RecipeReplacementDto,
    TargetCatalogDto,
    TargetCatalogEntryDto
} from "../../core/faculator-api/models/faculator-dtos";
import { LocalGameCatalog } from "./local-game-catalog";

@Service()
export class LocalRecipe implements RecipeGateway {
    private readonly catalogAdapter = inject(LocalGameCatalog);

    public async getTargetCatalog(): Promise<GatewayResultDto<TargetCatalogDto>> {
        const catalog = this.catalogAdapter.catalog;
        if (!catalog) {
            return GatewayResultDto.failure("catalog-not-ready", "Game catalog has not loaded.");
        }
        const producerCounts = new Map<string, number>();
        catalog.recipes.filter((recipe) => !recipe.hidden && recipe.ingredients.length > 0).forEach((recipe) => recipe.products.forEach((product) =>
            producerCounts.set(product.key, (producerCounts.get(product.key) ?? 0) + 1)
        ));
        const groupRank = new Map(catalog.groups.map((group, index) => [group.name, index]));
        const subgroupRank = new Map(catalog.groups.flatMap((group) => group.subgroups.map((subgroup, index) => [subgroup.name, index] as const)));
        const entries = catalog.materials
            .filter((entry) => !entry.hidden)
            .map((entry) => new TargetCatalogEntryDto(entry, producerCounts.get(entry.key) ?? 0))
            .sort((left, right) => (groupRank.get(left.group) ?? Number.MAX_SAFE_INTEGER) - (groupRank.get(right.group) ?? Number.MAX_SAFE_INTEGER)
                || (subgroupRank.get(left.subgroup) ?? Number.MAX_SAFE_INTEGER) - (subgroupRank.get(right.subgroup) ?? Number.MAX_SAFE_INTEGER)
                || left.order.localeCompare(right.order, "en"));
        const groups = catalog.groups.filter(group => entries.some(entry => entry.group === group.name));
        return GatewayResultDto.success(new TargetCatalogDto(groups, entries));
    }

    public async findProducers(material: MaterialDto): Promise<GatewayResultDto<ReadonlyArray<RecipeDto>>> {
        const catalog = this.catalogAdapter.catalog;
        if (!catalog) {
            return GatewayResultDto.failure("catalog-not-ready", "Game catalog has not loaded.");
        }
        const recipes = catalog.recipes
            .filter((recipe) => !recipe.hidden && recipe.ingredients.length > 0 && recipe.products.some((product) => product.key === material.key))
            .sort((left, right) => this.preference(left, material) - this.preference(right, material)
                || left.order.localeCompare(right.order, "en"));
        return GatewayResultDto.success(recipes);
    }

    public async replaceRecipe(
        snapshot: PlanningSnapshotDto,
        request: RecipeReplacementDto,
        recipeName: string
    ): Promise<GatewayResultDto<PlanningSnapshotDto>> {
        let found = false;
        const plans = snapshot.plans.map((plan) => new ProductionPlanDto(plan.id, plan.name, plan.blocks.map((block) =>
            new ProductionBlockDto(block.id, block.name, block.lines.map((line) => {
                if (line.id !== request.lineId) return line;
                found = true;
                const choices = new Map(line.recipeChoices);
                choices.set(request.choiceKey, recipeName);
                return new ProductionLineDto(line.id, line.title, line.targets, line.appliedTargets, choices, line.processConfigurations, line.exportedOutputs, true);
            }))
        )));
        return found
            ? GatewayResultDto.success(new PlanningSnapshotDto(plans, snapshot.activePlanId, snapshot.activeBlockId, snapshot.activeLineId))
            : GatewayResultDto.failure("line-not-found", `Unknown line ${request.lineId}`);
    }

    private preference(recipe: RecipeDto, material: MaterialDto): number {
        let score = recipe.name === material.name ? -1000 : 0;
        if (recipe.mainProduct?.key === material.key) score -= 600;
        if (recipe.name.includes("recycling")) score += 900;
        if (recipe.name.startsWith("empty-") && recipe.name.endsWith("-barrel")) score += 1200;
        return score;
    }
}
