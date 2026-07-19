import { Component, input, output } from "@angular/core";
import { GameIcon } from "../../components/shared/game-icon/game-icon";
import { ProcessDto, RecipeDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";

@Component({
    selector: "app-recipe-alternatives",
    imports: [GameIcon],
    templateUrl: "./recipe-alternatives.html",
    styleUrl: "./recipe-alternatives.scss"
})
export class RecipeAlternatives {
    public readonly process = input.required<ProcessDto>();
    public readonly recipes = input.required<ReadonlyArray<RecipeDto>>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly selected = output<string>();
    public readonly closed = output<void>();

    public outputPerCycle(recipe: RecipeDto): number {
        return recipe.products.find((product) => product.key === this.process().fulfills.key)?.amount ?? 0;
    }

    public formatRate(value: number): string {
        if (!Number.isFinite(value)) return "—";
        if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        if (Math.abs(value) >= 100) return value.toFixed(0);
        if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
        return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }

    public replaceRecipeLabel(): string { return this.locale() === "zh-CN" ? "更换配方" : "Replace recipe"; }
    public cancelLabel(): string { return this.locale() === "zh-CN" ? "取消" : "Cancel"; }
    public fulfillsDemandLabel(): string { return this.locale() === "zh-CN" ? "承接下游需求" : "Fulfills downstream demand"; }
    public alternativeHintLabel(): string { return this.locale() === "zh-CN"
        ? "只列出能产出相同下游物料的配方；替换后保持需求量不变，并重新展开上游 BOM。"
        : "Only recipes producing the same downstream material are shown. Replacement preserves demand and recalculates the upstream BOM."; }
    public preserveDemandLabel(): string { return this.locale() === "zh-CN" ? "下游需求保持不变" : "Downstream demand stays unchanged"; }
    public inputsLabel(): string { return this.locale() === "zh-CN" ? "输入" : "Inputs"; }
    public currentRecipeLabel(): string { return this.locale() === "zh-CN" ? "当前使用" : "Current recipe"; }
    public useAlternativeLabel(): string { return this.locale() === "zh-CN" ? "改用此配方" : "Use this recipe"; }
}
