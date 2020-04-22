import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterNameEditComponent } from './filter-name-edit.component';

describe('FilterNameEditComponent', () => {
  let component: FilterNameEditComponent;
  let fixture: ComponentFixture<FilterNameEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterNameEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterNameEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
