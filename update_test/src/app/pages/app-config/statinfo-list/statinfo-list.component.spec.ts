import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatinfoListComponent } from './statinfo-list.component';

describe('StatinfoListComponent', () => {
  let component: StatinfoListComponent;
  let fixture: ComponentFixture<StatinfoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatinfoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatinfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
