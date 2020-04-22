import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildNewComponent } from './build-new.component';

describe('BuildNewComponent', () => {
  let component: BuildNewComponent;
  let fixture: ComponentFixture<BuildNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

});
