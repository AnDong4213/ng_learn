import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiExperiment } from 'adhoc-api';
import { Experiment, Version, VersionTyp, VersionStatus } from '../../../model';
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { AuthGuard } from '../../../system/auth-guard.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  expid: string;
  // exp: Observable<Experiment>;
  exp: Experiment;
  exp$: ReplaySubject<Experiment>;

  versionTyp = VersionTyp;
  versionStatus = VersionStatus;

  constructor(private route: ActivatedRoute,
  private apiExp: ApiExperiment) {

    this.exp = new Experiment();
    this.exp$ = new ReplaySubject<Experiment>(1);
    this.exp$.subscribe(exp => this.exp = exp );
  }

  async ngOnInit() {
    this.expid = this.route.snapshot.parent.params['id'];
    const exp = await this.apiExp.getExpById(this.expid)

      this.exp = exp as Experiment;
      this.exp$.next(exp as Experiment);

  }


}

export const SettingRouter = {
  path:  'setting',
  canActivate: [AuthGuard],
  component: SettingComponent
};
