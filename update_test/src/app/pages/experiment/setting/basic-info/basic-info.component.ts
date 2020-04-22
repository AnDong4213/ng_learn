import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Version, Layer, App, Experiment } from '../../../../model';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

import { ApiExperiment } from 'adhoc-api';
import { CurAppService } from '../../../../service/cur-app.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CheckRepeatValidator } from '../../../../utils/validators';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  @Input() exp$: Subject<Experiment>;
  appid: string;
  expType: string;
  curExp: Experiment;
  versions: Array<Version>;
  subscription: ISubscription;
  layers: Array<Layer>;

  allVersions: Array<Version>;

  isShowLog = false;
  nameForm: FormGroup;
  isEditName = false;
  desForm: FormGroup;
  isEditDes = false;
  expNames = [];
  nameFormSubmit = false;
  oldName: string;

    constructor(private fb: FormBuilder,
      private apiExp: ApiExperiment,
      private router: Router,
      private curApp: CurAppService,
      private toast: ToastrService) {
    }

  ngOnInit() {
    const app = this.curApp.getApp();
    if (app) {
      this.appid = this.curApp.getApp().id;
    }else {
      this.router.navigate(['/app_manager']);
    }

    this.subscription = this.exp$.subscribe(res => {
      this.curExp = res;
      this.expType = this.curExp.typ;
      this.oldName = this.curExp.name;
      this.versions = (res as Experiment).getVersions();
      this.buildNameForm();
      this.buildDesForm();
      this.getExpNames();
    });

    this.apiExp.getAllVersions(this.appid).then(versions => this.allVersions = versions);


    this.apiExp.getLayersByAppId(this.appid).then(lists => {
      this.layers = lists;
    });
  }

  getExpNames() {
    this.apiExp.getAllExpNames(this.appid).then(res => {
      this.expNames = res as Array<any>;
      this.buildNameForm();
    });
  }

  editDes() {
    this.isEditDes = true;
  }

  saveDes(e, form) {
    e.stopPropagation();
    if (!form.valid) {
      return false;
    }
    this.isEditDes = false;

    this.curExp.description = form.value.des;
    this.apiExp.updateExp(this.curExp.id, this.curExp).then(res => {
      this.toast.success('试验描述修改成功');
    });
  }

  buildDesForm(){
    this.desForm = this.fb.group({
      des: [
        this.curExp['description'],
        Validators.required
      ]
    });
  }

  editName(){
    this.isEditName = true;
  }

  saveName(e, form) {
    e.stopPropagation();
    this.nameFormSubmit = true;
    if (form.value.name ===  this.oldName) {
      this.isEditName = false;
    }
    if (!form.valid) {
      return false;
    }
    this.isEditName = false;

    this.curExp.name = form.value.name;
    this.apiExp.updateExp(this.curExp.id, this.curExp).then(res => {
      this.curApp.$curExp.next(this.curExp);
      this.toast.success('试验名称修改成功');
      this.oldName = this.curExp.name;
      this.getExpNames();
    });

  }

  buildNameForm() {
    this.nameForm = this.fb.group({
    name: [ this.curExp['name'],
      Validators.compose([
        Validators.required,
        CheckRepeatValidator(this.expNames)
      ])
    ],
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getLayerNameById(layerid) {
   if (!this.layers) {
     return 'loading...';
   }
   const result = this.layers.find(layer => layer.id === layerid);
   return result ? result.name : '默认层';
  }

  getLayerTraffice(layerid) {
    if (!this.allVersions) {
      return 'landing';
    }
    const filterList = this.allVersions.filter(v => v['layer_id'] === layerid);
    const count = filterList.reduce((sum: number, v: Version) =>  sum += v['traffic'], 0);
    return 100 - count;
  }

  openLog() {
    this.isShowLog = true;
  }
  closeLog() {
    this.isShowLog = false;
  }

}
