import { Component, inject, OnInit } from "@angular/core";

import { GameIcon } from "../components/shared/game-icon/game-icon";
import { PanelShell, PanelShellVariant } from "../components/ui/panel-shell";
import { LoadState } from "../core/faculator-api/models/load-state";
import { Locale } from "../core/faculator-api/models/locale";
import { BlockSidebar } from "./block-sidebar/block-sidebar";
import { GoalRail } from "./goal-rail/goal-rail";
import { ObservationWorkspace } from "./observation-workspace/observation-workspace";
import { PlanTabs } from "./plan-tabs/plan-tabs";
import { PlannerStore } from "./planner-store";
import { ResultDrawer } from "./result-drawer/result-drawer";
import { RecipeAlternatives } from "./recipe-alternatives/recipe-alternatives";
import { PromoteOutput } from "./promote-output/promote-output";
import { TargetEncyclopedia } from "./target-encyclopedia/target-encyclopedia";
import { WorkspaceHeader } from "./workspace-header/workspace-header";

@Component({
    selector: "app-planner",
    imports: [
        GameIcon,
        PanelShell,
        PlanTabs,
        BlockSidebar,
        WorkspaceHeader,
        ObservationWorkspace,
        GoalRail,
        ResultDrawer,
        TargetEncyclopedia,
        RecipeAlternatives,
        PromoteOutput
    ],
    templateUrl: "./planner.html",
    styleUrl: "./planner.scss"
})
export class Planner implements OnInit {
    protected readonly store = inject(PlannerStore);
    protected readonly LoadState = LoadState;
    protected readonly Locale = Locale;
    protected readonly PanelShellVariant = PanelShellVariant;

    public ngOnInit(): void {
        void this.store.initialize();
    }
}
