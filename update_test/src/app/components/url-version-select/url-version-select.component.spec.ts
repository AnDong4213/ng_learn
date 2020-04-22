import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlVersionSelectComponent } from './url-version-select.component';

describe('UrlVersionSelectComponent', () => {
  let component: UrlVersionSelectComponent;
  let fixture: ComponentFixture<UrlVersionSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlVersionSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlVersionSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
