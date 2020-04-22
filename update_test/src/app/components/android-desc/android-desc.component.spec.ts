import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AndroidDescComponent } from './android-desc.component';

describe('AndroidDescComponent', () => {
  let component: AndroidDescComponent;
  let fixture: ComponentFixture<AndroidDescComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AndroidDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AndroidDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
