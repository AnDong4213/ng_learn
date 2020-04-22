import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckPwdComponent } from './check-pwd.component';

describe('CheckPwdComponent', () => {
  let component: CheckPwdComponent;
  let fixture: ComponentFixture<CheckPwdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckPwdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckPwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
