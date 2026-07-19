import { Component, input } from "@angular/core";

import { ProductionBlockDto, ProductionPlanDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";

@Component({
    selector: "app-workspace-header",
    templateUrl: "./workspace-header.html",
    styleUrl: "./workspace-header.scss"
})
export class WorkspaceHeader {
    public readonly plan = input.required<ProductionPlanDto>();
    public readonly block = input.required<ProductionBlockDto>();
    public readonly locale = input.required<Locale>();
}
