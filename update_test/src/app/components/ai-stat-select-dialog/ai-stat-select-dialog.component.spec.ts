import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AiStatSelectDialogComponent } from './ai-stat-select-dialog.component';

describe('AiStatSelectDialogComponent', () => {
  let component: AiStatSelectDialogComponent;
  let fixture: ComponentFixture<AiStatSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AiStatSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AiStatSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
