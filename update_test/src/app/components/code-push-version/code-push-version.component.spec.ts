import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodePushVersionComponent } from './code-push-version.component';

describe('CodePushVersionComponent', () => {
  let component: CodePushVersionComponent;
  let fixture: ComponentFixture<CodePushVersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodePushVersionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodePushVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
