import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurAppService } from '../../service/cur-app.service';
import { ApiExperiment } from 'adhoc-api';
import { Experiment, StatusDict, Layer, App } from '../../model';

import { overlayConfigFactory } from 'ngx-modialog';

import {
  VEXBuiltInThemes,
  Modal,
  DialogPreset,
  DialogFormModal,
  DialogPresetBuilder,
  VEXModalContext,
  vexV3Mode,
  providers
} from 'ngx-modialog/plugins/vex';

import { ExpTypSelectDialogComponent } from '../../components/exp-typ-select-dialog/exp-typ-select-dialog.component';


@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss']
})
export class ExperimentComponent implements OnInit {
  expid: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.expid = this.route.snapshot.params['id'];
  }
}

