import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDimensionDialogComponent } from './export-dimension-dialog.component';

describe('ExportDimensionDialogComponent', () => {
  let component: ExportDimensionDialogComponent;
  let fixture: ComponentFixture<ExportDimensionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportDimensionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDimensionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
