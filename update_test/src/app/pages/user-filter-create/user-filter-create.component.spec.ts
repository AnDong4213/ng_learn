import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFilterCreateComponent } from './user-filter-create.component';

describe('UserFilterCreateComponent', () => {
  let component: UserFilterCreateComponent;
  let fixture: ComponentFixture<UserFilterCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserFilterCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFilterCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
