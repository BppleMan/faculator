import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacButton } from './fac-button';

describe('FacButton', () => {
  let component: FacButton;
  let fixture: ComponentFixture<FacButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
