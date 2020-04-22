import { Component, OnInit, Inject, Input } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import { Experiment, App, VersionStatus, APP_TYPE_H5 } from '../../../model';
import { CurAppService } from '../../../service/cur-app.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  id: string;
  @Input() exp : Experiment;
  vss = VersionStatus;
  APP_TYPE_H5 = APP_TYPE_H5;
  app : App;

  constructor(@Inject(ActivatedRoute) private router: ActivatedRoute,
  private curApp: CurAppService) { }

  ngOnInit() {
    this.app = this.curApp.getApp();
    this.router.params.subscribe((params: Params) => {
      this.id = params['id'];
    });
  }

}

export const SidebarRouter = {
  path: 'sidebar',
  component: SidebarComponent
};
