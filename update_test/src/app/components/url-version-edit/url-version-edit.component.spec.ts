import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlVersionEditComponent } from './url-version-edit.component';

describe('UrlVersionEditComponent', () => {
  let component: UrlVersionEditComponent;
  let fixture: ComponentFixture<UrlVersionEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlVersionEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlVersionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
