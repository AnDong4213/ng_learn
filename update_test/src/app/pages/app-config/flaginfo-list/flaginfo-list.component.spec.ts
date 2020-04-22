import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlaginfoListComponent } from './flaginfo-list.component';

describe('FlaginfoListComponent', () => {
  let component: FlaginfoListComponent;
  let fixture: ComponentFixture<FlaginfoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlaginfoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlaginfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
