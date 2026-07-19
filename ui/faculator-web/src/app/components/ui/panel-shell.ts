import { Directive, input } from "@angular/core";

/** Visual anatomy shared by structural panels while their semantic host remains intact. */
export enum PanelShellVariant {
    Cabinet = "cabinet",
    Header = "header",
    Toolbar = "toolbar",
    Summary = "summary",
    Brand = "brand"
}

@Directive({
    selector: "[appPanelShell]",
    host: {
        class: "fac-panel-shell",
        "[attr.data-fac-panel]": "variant()"
    }
})
export class PanelShell {
    public readonly variant = input<PanelShellVariant>(PanelShellVariant.Cabinet, { alias: "appPanelShell" });
}
