import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkConfigComponent } from './sdk-config.component';

describe('SdkConfigComponent', () => {
  let component: SdkConfigComponent;
  let fixture: ComponentFixture<SdkConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SdkConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SdkConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
