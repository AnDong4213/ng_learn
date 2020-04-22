import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorDotComponent } from './color-dot.component';

describe('ColorDotComponent', () => {
  let component: ColorDotComponent;
  let fixture: ComponentFixture<ColorDotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorDotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorDotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
