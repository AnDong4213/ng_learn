import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeComStatEditComponent } from './code-com-stat-edit.component';

describe('CodeComStatEditComponent', () => {
  let component: CodeComStatEditComponent;
  let fixture: ComponentFixture<CodeComStatEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeComStatEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeComStatEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
