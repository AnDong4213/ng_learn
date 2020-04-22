import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeStatEditComponent } from './code-stat-edit.component';

describe('CodeStatEditComponent', () => {
  let component: CodeStatEditComponent;
  let fixture: ComponentFixture<CodeStatEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeStatEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeStatEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
