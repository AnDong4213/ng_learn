import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { App, APP_TYPE_H5 } from '../../../model';
import { CurAppService } from '../../../service/cur-app.service';
import { AuthGuard } from '../../../system/auth-guard.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {
  expid: string;
  app: App;
  APP_TYPE_H5 = APP_TYPE_H5;

  constructor(private route: ActivatedRoute,
    private curApp: CurAppService) { }

  ngOnInit() {
    this.app = this.curApp.getApp();
    this.expid = this.route.snapshot.parent.params['id'];
  }

}

export const DataRouter = {
  path: 'data',
  canActivate: [AuthGuard],
  component: DataComponent
};
