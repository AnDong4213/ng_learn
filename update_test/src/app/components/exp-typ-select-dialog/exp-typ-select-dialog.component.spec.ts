import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpTypSelectDialogComponent } from './exp-typ-select-dialog.component';

describe('ExpTypSelectDialogComponent', () => {
  let component: ExpTypSelectDialogComponent;
  let fixture: ComponentFixture<ExpTypSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpTypSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpTypSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
