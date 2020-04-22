import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeVersionEditComponent } from './code-version-edit.component';

describe('CodeVersionEditComponent', () => {
  let component: CodeVersionEditComponent;
  let fixture: ComponentFixture<CodeVersionEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeVersionEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeVersionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
