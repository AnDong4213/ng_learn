import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IosEditorComponent } from './ios-editor.component';

describe('EditorComponent', () => {
  let component: IosEditorComponent;
  let fixture: ComponentFixture<IosEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IosEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
