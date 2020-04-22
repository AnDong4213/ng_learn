import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevtestCpIdDialogComponent } from './devtest-cp-id-dialog.component';

describe('DevtestCpIdDialogComponent', () => {
  let component: DevtestCpIdDialogComponent;
  let fixture: ComponentFixture<DevtestCpIdDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevtestCpIdDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevtestCpIdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
