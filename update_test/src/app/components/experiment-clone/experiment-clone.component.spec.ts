import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentCloneComponent } from './experiment-clone.component';

describe('ExperimentCloneComponent', () => {
  let component: ExperimentCloneComponent;
  let fixture: ComponentFixture<ExperimentCloneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperimentCloneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentCloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
