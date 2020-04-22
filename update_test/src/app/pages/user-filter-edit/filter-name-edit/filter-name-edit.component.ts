import { Component, OnInit, Input, Output, ViewChild, ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { Audience } from '../../../model/audience';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: '[app-filter-name-edit]',
  templateUrl: './filter-name-edit.component.html',
  styleUrls: ['./filter-name-edit.component.scss']
})
export class FilterNameEditComponent implements OnInit, AfterViewInit {

  @Input() audience: Audience;
  @Input() index: number;
  @Output() newAudience = new EventEmitter();
  @Output() delAudience = new EventEmitter();
  editAudienceForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.formBuild();
  }

  formBuild() {
    this.editAudienceForm = this.fb.group({
      name: [
        this.audience.name,
        Validators.required
      ]
    });
  }

  submit(form) {
    if (!form.valid || form.value.name == this.audience.name) {
      this.audience.isEdit = false;
      return false;
    }
    this.newAudience.emit(form.value.name);
    this.audience.isEdit = false;
  }

  edit() {
    this.audience.isEdit = true;
  }

  ngAfterViewInit() {
  }

  delete() {
    this.delAudience.emit(this.audience);
  }

}
