import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildVersionItemComponent } from './build-version-item.component';

describe('BuildVersionItemComponent', () => {
  let component: BuildVersionItemComponent;
  let fixture: ComponentFixture<BuildVersionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildVersionItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildVersionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
