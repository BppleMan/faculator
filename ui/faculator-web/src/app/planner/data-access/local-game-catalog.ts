import { Service } from "@angular/core";

import { GameCatalogGateway } from "../../core/faculator-api/contracts/game-catalog-gateway";
import {
    CatalogMaterialDto,
    GameCatalogDto,
    GatewayResultDto,
    ItemGroupDto,
    ItemSubgroupDto,
    MachineDto,
    MaterialDto,
    ModuleDto,
    QualityDto,
    RecipeDto
} from "../../core/faculator-api/models/faculator-dtos";

type JsonRecord = Record<string, unknown>;

@Service()
export class LocalGameCatalog implements GameCatalogGateway {
    private loadedCatalog: GameCatalogDto | null = null;

    public get catalog(): GameCatalogDto | null {
        return this.loadedCatalog;
    }

    public async load(): Promise<GatewayResultDto<GameCatalogDto>> {
        if (this.loadedCatalog) {
            return GatewayResultDto.success(this.loadedCatalog);
        }
        try {
            const [gameResponse, chineseResponse, englishResponse] = await Promise.all([
                fetch("/exported/game-data.json"), fetch("/exported/translations-zh-CN.json"), fetch("/exported/translations-en.json")
            ]);
            if (!gameResponse.ok || !chineseResponse.ok || !englishResponse.ok) {
                return GatewayResultDto.failure("catalog-http-error", "Unable to load Factorio catalog resources.");
            }
            const raw = this.record(await gameResponse.json());
            const chinese = this.translationMap(this.record(await chineseResponse.json()));
            const english = this.translationMap(this.record(await englishResponse.json()));
            this.loadedCatalog = this.mapCatalog(raw, chinese, english);
            return GatewayResultDto.success(this.loadedCatalog);
        } catch (error: unknown) {
            return GatewayResultDto.failure("catalog-load-failed", error instanceof Error ? error.message : "Unknown catalog error");
        }
    }

    private mapCatalog(raw: JsonRecord, chinese: ReadonlyMap<string, string>, english: ReadonlyMap<string, string>): GameCatalogDto {
        const game = this.record(raw["game"]);
        const groups = this.records(raw["item_groups"])
            .filter((entry) => !this.boolean(entry["hidden"]))
            .map((entry) => new ItemGroupDto(
                this.string(entry["name"]),
                this.string(entry["order"]),
                this.records(entry["subgroups"])
                    .map((subgroup) => new ItemSubgroupDto(this.string(subgroup["name"]), this.string(subgroup["order"])))
                    .sort((left, right) => left.order.localeCompare(right.order, "en"))
            ))
            .sort((left, right) => left.order.localeCompare(right.order, "en"));
        const materials = [
            ...this.records(raw["items"]).map((entry) => this.mapMaterial(entry, "item")),
            ...this.records(raw["fluids"]).map((entry) => this.mapMaterial(entry, "fluid"))
        ];
        const recipes = this.records(raw["recipes"]).map((entry) => this.mapRecipe(entry));
        const machines = this.records(raw["entities"])
            .map((entry) => new MachineDto(
                this.string(entry["name"]), this.string(entry["order"]), this.number(entry["crafting_speed"]),
                this.strings(entry["crafting_categories"]), this.number(entry["module_inventory_size"])
            ))
            .filter((entry) => entry.craftingSpeed > 0)
            .sort((left, right) => left.order.localeCompare(right.order, "en"));
        const modules = this.records(raw["items"])
            .filter((entry) => this.string(entry["type"]) === "module")
            .map((entry) => {
                const effects = this.record(entry["module_effects"]);
                return new ModuleDto(
                    this.string(entry["name"]), this.string(entry["order"]),
                    this.number(effects["speed"]), this.number(effects["productivity"]),
                    this.number(effects["quality"]), this.number(effects["consumption"])
                );
            })
            .sort((left, right) => left.order.localeCompare(right.order, "en"));
        const qualities = this.records(raw["qualities"])
            .filter((entry) => !this.boolean(entry["hidden"]))
            .map((entry) => new QualityDto(this.string(entry["name"]), this.string(entry["order"]), this.number(entry["level"])))
            .sort((left, right) => left.order.localeCompare(right.order, "en"));
        return new GameCatalogDto(
            this.string(game["factorio_version"]), this.string(game["exporter_version"]), groups, materials, recipes, machines,
            modules, qualities, new Map([["zh-CN", chinese], ["en", english]])
        );
    }

    private mapMaterial(entry: JsonRecord, type: string): CatalogMaterialDto {
        return new CatalogMaterialDto(
            type, this.string(entry["name"]), this.string(entry["group"]), this.string(entry["subgroup"]),
            this.string(entry["order"]), this.boolean(entry["hidden"]), typeof entry["stack_size"] === "number" ? entry["stack_size"] : null
        );
    }

    private mapRecipe(entry: JsonRecord): RecipeDto {
        const mainProduct = this.recordOrNull(entry["main_product"]);
        return new RecipeDto(
            this.string(entry["name"]), this.string(entry["group"]), this.string(entry["subgroup"]), this.string(entry["order"]),
            this.string(entry["category"]), Math.max(this.number(entry["energy"]), 0.001),
            this.records(entry["ingredients"]).map((material) => this.mapRecipeMaterial(material)),
            this.records(entry["products"]).map((material) => this.mapRecipeMaterial(material)),
            mainProduct ? this.mapRecipeMaterial(mainProduct) : null, this.boolean(entry["hidden"]), this.number(entry["maximum_productivity"])
        );
    }

    private mapRecipeMaterial(entry: JsonRecord): MaterialDto {
        const probability = typeof entry["probability"] === "number" ? entry["probability"] : 1;
        return new MaterialDto(
            this.string(entry["type"]),
            this.string(entry["name"]),
            this.number(entry["amount"]) * probability,
            this.number(entry["ignored_by_stats"])
        );
    }

    private translationMap(raw: JsonRecord): ReadonlyMap<string, string> {
        return new Map(Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    }

    private records(value: unknown): ReadonlyArray<JsonRecord> {
        return Array.isArray(value) ? value.filter((entry): entry is JsonRecord => this.isRecord(entry)) : [];
    }

    private strings(value: unknown): ReadonlyArray<string> {
        return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
    }

    private record(value: unknown): JsonRecord {
        return this.isRecord(value) ? value : {};
    }

    private recordOrNull(value: unknown): JsonRecord | null {
        return this.isRecord(value) ? value : null;
    }

    private isRecord(value: unknown): value is JsonRecord {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }

    private string(value: unknown): string {
        return typeof value === "string" ? value : "";
    }

    private number(value: unknown): number {
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
    }

    private boolean(value: unknown): boolean {
        return value === true;
    }
}
