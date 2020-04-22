import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeComstatItemComponent } from './code-comstat-item.component';

describe('CodeComstatItemComponent', () => {
  let component: CodeComstatItemComponent;
  let fixture: ComponentFixture<CodeComstatItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeComstatItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeComstatItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
