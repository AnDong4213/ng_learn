import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRetentionComponent } from './data-retention.component';

describe('DataRetentionComponent', () => {
  let component: DataRetentionComponent;
  let fixture: ComponentFixture<DataRetentionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataRetentionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataRetentionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
