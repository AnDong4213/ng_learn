import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFilterEditComponent } from './user-filter-edit.component';

describe('UserFilterEditComponent', () => {
  let component: UserFilterEditComponent;
  let fixture: ComponentFixture<UserFilterEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserFilterEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFilterEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
