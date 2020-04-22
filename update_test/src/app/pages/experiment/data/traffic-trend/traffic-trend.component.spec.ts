import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficTrendComponent } from './traffic-trend.component';

describe('TrafficTrendComponent', () => {
  let component: TrafficTrendComponent;
  let fixture: ComponentFixture<TrafficTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrafficTrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrafficTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
