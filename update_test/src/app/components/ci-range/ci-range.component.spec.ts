import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CiRangeComponent } from './ci-range.component';

describe('CiRangeComponent', () => {
  let component: CiRangeComponent;
  let fixture: ComponentFixture<CiRangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CiRangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CiRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
