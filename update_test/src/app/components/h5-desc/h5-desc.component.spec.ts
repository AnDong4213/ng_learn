import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { H5DescComponent } from './h5-desc.component';

describe('H5DescComponent', () => {
  let component: H5DescComponent;
  let fixture: ComponentFixture<H5DescComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ H5DescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(H5DescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
