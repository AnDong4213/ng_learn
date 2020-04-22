import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComstatinfoListComponent } from './comstatinfo-list.component';

describe('ComstatinfoListComponent', () => {
  let component: ComstatinfoListComponent;
  let fixture: ComponentFixture<ComstatinfoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComstatinfoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComstatinfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
