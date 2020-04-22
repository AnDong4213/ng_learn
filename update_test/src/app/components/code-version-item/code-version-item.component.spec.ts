import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeVersionItemComponent } from './code-version-item.component';

describe('CodeVersionItemComponent', () => {
  let component: CodeVersionItemComponent;
  let fixture: ComponentFixture<CodeVersionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeVersionItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeVersionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
