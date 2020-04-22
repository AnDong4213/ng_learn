import { Component, OnInit, Input } from '@angular/core';
import { ApiExperiment, ApiData } from 'adhoc-api';
import { Experiment, Stat, App, VersionStatus } from '../../model';
import { Subject } from 'rxjs';
import { CurAppService } from '../../service/cur-app.service';

import { Observable } from 'rxjs/';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-code-com-stat-edit',
  templateUrl: './code-com-stat-edit.component.html',
  styleUrls: ['./code-com-stat-edit.component.scss']
})
export class CodeComStatEditComponent implements OnInit {
  @Input() exp$: Subject<Experiment>;
  exp: Experiment;
  app: App;

  stats: Array<Stat>;
  allComStats: Array<Stat>;
  defStats: Array<Stat>;

  curStats: Array<Stat>;
  curComStats: Array<Stat>;

  validStats: Array<Stat>;
  versionStatus = VersionStatus;

  constructor(private apiExp: ApiExperiment,
    private apiData: ApiData,
    curApp: CurAppService) {
    this.app = curApp.getApp();
    this.curStats = new Array<Stat>();
  }

  ngOnInit() {

    this.exp$.subscribe(exp => {
      this.exp = exp;
      this.apiData.getStat(this.app.id).then(stat => {
        this.allComStats = stat.filter(s => s.isComStat() === true) || [];

        this.stats = stat;
      }).then(stat => {

        if (this.exp.control.stats.length > 0) {

          const curStatAll = this.stats.filter(s => {

            return this.exp.control.stats.find(statkey => statkey === s.name) ? true : false;
          });
          this.curStats = curStatAll.filter(itemStat => !itemStat.isComStat());
          this.validStats = this.curStats;

          this.curComStats = curStatAll.filter(itemStat => itemStat.isComStat());


        }
      });
    });


  }

  newComStat() {
    if (this.curComStats && this.curComStats.length > 0) {
      const lastStat = this.curComStats[this.curComStats.length - 1];
      if (!lastStat || lastStat.isNew) {
        return;
      }
    }

    const newStat = new Stat({
      isNew: true
    });

    if (!this.curComStats) {
      this.curComStats = [];
    }
    this.curComStats.push(newStat);
  }

  delItem(stat) {
    const index = this.curComStats.findIndex(s => s.name === stat.name);
    if (index > -1) {
      this.curComStats.splice(index, 1);
      const statNames = this.getAllStatNames();
      // exp exist server
      if (this.exp.id) {
        this.upStatForExpRelation(statNames);
      } else {
        this.exp.control.stats = statNames;
        this.exp.experiments.map(v => {
          v.stats = statNames;
        });
      }
    }
  }

  getAllStatNames() {
    let names = [];

    const statNames = this.curStats.reduce((sum: Array<string>, item: Stat) => {
      sum.push(item.name);
      return sum;
    }, []);

    const statComnames = this.curComStats.reduce((sum: Array<string>, stat: Stat) => {
      sum.push(stat.name);
      return sum;
    }, []);

    names = names.concat(statNames);
    names = names.concat(statComnames);
    return names;
  }

  upStatForExpRelation(stats: Array<string>) {
    const vss = this.exp.getVersions();
    vss.map(v => {
      v.stats = stats;
    });
    this.exp.setVersions(vss);
    this.apiExp.updateExpWithVersions(this.exp.id, vss).then(result => {
      this.exp.setVersions(vss);
      this.exp$.next(this.exp);
    });
  }

  asyncStat(stat: Stat) {
    stat.app_id = this.app.id;
    this.apiData.updateStat(this.app.id, stat).then(res => { });
  }

  saveItem(stat: Stat) {
    this.asyncStat(stat);
    const statNames = this.getAllStatNames();
    if (this.exp.id) {
      this.upStatForExpRelation(statNames);
    } else {
      this.exp.control.stats = statNames;
      this.exp.experiments.map(v => v.stats = statNames);
      this.exp$.next(this.exp);
    }
  }

}
