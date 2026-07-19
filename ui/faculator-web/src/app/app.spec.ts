import { provideRouter, RouterOutlet } from "@angular/router";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { describe, expect, it } from "vitest";

import { App } from "./app";

describe("App", () => {
    it("provides a router-only application shell", async () => {
        await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
        const fixture = TestBed.createComponent(App);
        await fixture.whenStable();
        expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
    });
});
