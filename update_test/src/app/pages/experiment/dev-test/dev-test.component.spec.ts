import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevTestComponent } from './dev-test.component';

describe('DevTestComponent', () => {
  let component: DevTestComponent;
  let fixture: ComponentFixture<DevTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
