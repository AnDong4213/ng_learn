import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeStatusBarComponent } from './charge-status-bar.component';

describe('ChargeStatusBarComponent', () => {
  let component: ChargeStatusBarComponent;
  let fixture: ComponentFixture<ChargeStatusBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargeStatusBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
