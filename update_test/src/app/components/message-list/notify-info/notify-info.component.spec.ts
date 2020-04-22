import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifyInfoComponent } from './notify-info.component';

describe('NotifyInfoComponent', () => {
  let component: NotifyInfoComponent;
  let fixture: ComponentFixture<NotifyInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifyInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
