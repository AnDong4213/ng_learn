import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindMobileComponent } from './bind-mobile-modal.component';

describe('BindMobileComponent', () => {
  let component: BindMobileComponent;
  let fixture: ComponentFixture<BindMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});