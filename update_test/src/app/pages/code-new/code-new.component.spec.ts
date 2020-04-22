import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeNewComponent } from './code-new.component';

describe('CodeNewComponent', () => {
  let component: CodeNewComponent;
  let fixture: ComponentFixture<CodeNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
