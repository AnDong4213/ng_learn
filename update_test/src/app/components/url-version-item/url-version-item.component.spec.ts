import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlVersionItemComponent } from './url-version-item.component';

describe('UrlVersionItemComponent', () => {
  let component: UrlVersionItemComponent;
  let fixture: ComponentFixture<UrlVersionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlVersionItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlVersionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
