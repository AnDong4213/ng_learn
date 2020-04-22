import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeStatItemComponent } from './code-stat-item.component';

describe('CodeStatItemComponent', () => {
  let component: CodeStatItemComponent;
  let fixture: ComponentFixture<CodeStatItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeStatItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeStatItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
