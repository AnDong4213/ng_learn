import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlNewComponent } from './url-new.component';

describe('UrlNewComponent', () => {
  let component: UrlNewComponent;
  let fixture: ComponentFixture<UrlNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
