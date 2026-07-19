import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./planner/planner").then((module) => module.Planner)
    }
];
