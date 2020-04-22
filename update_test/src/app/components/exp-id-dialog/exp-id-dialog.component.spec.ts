import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpIdDialogComponent } from './exp-id-dialog.component';

describe('ExpIdDialogComponent', () => {
  let component: ExpIdDialogComponent;
  let fixture: ComponentFixture<ExpIdDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpIdDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpIdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
