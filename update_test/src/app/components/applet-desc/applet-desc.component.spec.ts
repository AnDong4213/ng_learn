import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletDescComponent } from './applet-desc.component';

describe('AppletDescComponent', () => {
  let component: AppletDescComponent;
  let fixture: ComponentFixture<AppletDescComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppletDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppletDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
