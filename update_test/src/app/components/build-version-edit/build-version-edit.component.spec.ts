import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildVersionEditComponent } from './build-version-edit.component';

describe('BuildVersionEditComponent', () => {
  let component: BuildVersionEditComponent;
  let fixture: ComponentFixture<BuildVersionEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildVersionEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildVersionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
