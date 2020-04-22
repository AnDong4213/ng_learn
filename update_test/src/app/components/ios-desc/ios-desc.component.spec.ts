import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IosDescComponent } from './ios-desc.component';

describe('IosDescComponent', () => {
  let component: IosDescComponent;
  let fixture: ComponentFixture<IosDescComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IosDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
