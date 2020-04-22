import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteListDialogComponent } from './white-list-dialog.component';

describe('WhiteListDialogComponent', () => {
  let component: WhiteListDialogComponent;
  let fixture: ComponentFixture<WhiteListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
