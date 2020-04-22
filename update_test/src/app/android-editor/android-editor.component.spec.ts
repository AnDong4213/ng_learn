import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AndroidEditorComponent } from './android-editor.component';

describe('EditorComponent', () => {
  let component: AndroidEditorComponent;
  let fixture: ComponentFixture<AndroidEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AndroidEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AndroidEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
