import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApiExperiment, ApiData, ApiH5 } from 'adhoc-api';
import { Experiment, Stat, App, AppType, Version, VersionTyp, VersionStatus } from '../../model';
import { Subject } from 'rxjs';
import { CurAppService } from '../../service/cur-app.service';
import { TokenService } from '../../service/token.service';
import { ABService } from '../../service/ab.service';
import { AbKeystatService } from '../../service/ab-keystat.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-code-stat-edit',
  templateUrl: './code-stat-edit.component.html',
  styleUrls: ['./code-stat-edit.component.scss']
})
export class CodeStatEditComponent implements OnInit {
  @Input() exp$: Subject<Experiment>;
  exp: Experiment;
  app: App;
  versions: Array<Version>;
  versionTyp = VersionTyp;
  isShowSelect = false;
  versionStatus = VersionStatus;

  stats: Array<Stat>;
  comStats: Array<Stat>;
  curStats: Array<Stat>;
  curComStats: Array<Stat>;
  thisStat: Stat;
  isLoading = true;
  ifNewKeyStat: Boolean = false;
  nowSelectStatName: string;
  thisKeyStat: Stat;
  allStats: Array<Stat>;

  constructor(private apiExp: ApiExperiment,
    private apiData: ApiData,
    private ab: ABService,
    private token: TokenService,
    private apih5: ApiH5,
    private abKeyStat: AbKeystatService,
    curApp: CurAppService,
    private translate: TranslateService,
    private router: Router,
    private toastrService: ToastrService) {

    this.app = curApp.getApp();
    this.curStats = new Array<Stat>();
    this.curComStats = new Array<Stat>();
  }

  ngOnInit() {

    this.exp$.subscribe(async exp => {
      this.exp = exp;
      this.versions = this.exp.getVersions();

      const stat = await this.apiData.getStat(this.app.id);
      this.allStats = stat;
      this.stats = stat.filter(s => s.isComStat() === false) || [];

      this.comStats = stat.filter(s => s.isComStat() === true) || [];
      this.isLoading = false;


      if (this.exp.control.stats.length > 0) {
        const buildStatus = this.findBuildStats(this.exp);

        this.curStats = this.stats.filter(s => {
          return this.exp.control.stats.find(statkey => statkey === s.name) ? true : false;
        });

        this.curStats.forEach(s => {
          if (buildStatus) {
            buildStatus.includes(s.name) ? s.isBuild = true : s.isBuild = false;
          }
        });

        this.curComStats = this.comStats.filter(s => {
          return this.exp.control.stats.find(statkey => statkey === s.name) ? true : false;
        });

      }


      if (this.exp.id) {

        this.apiData.getKeyStat(this.exp.id).then(res => {
          if (res['error_code']) {

            this.thisKeyStat = this.abKeyStat.getKeyStat();
            this.nowSelectStatName = this.abKeyStat.getKeyStatName();

            if (this.thisKeyStat) {
              this.apiData.setKeyStat(this.exp.id, this.nowSelectStatName).then(resp => {
                if (resp['error_code']) {
                  this.toastrService.error(resp['reason_display']);
                  return
                }
                this.abKeyStat.setKeyStat(undefined);
              })
            } else if (!this.thisKeyStat && this.curStats.length != 0) {
              // this.thisKeyStat = this.curStats[0];
              // this.nowSelectStatName = this.curStats[0].name;

              // this.apiData.setKeyStat(this.exp.id, this.nowSelectStatName).then(resp => {
              //   if (resp['error_code']) {
              //     this.toastrService.error(resp['reason_display']);
              //     return
              //   }
              //   this.abKeyStat.setKeyStat(undefined);
              // })
            }


          } else {
            const myKeyStat = this.stats.filter(item => item.name === res['result']['indicators'])[0];
            if (myKeyStat) {
              this.thisKeyStat = myKeyStat;
              this.nowSelectStatName = myKeyStat.name
            }

          }

        })
      } else {
        this.thisKeyStat = this.abKeyStat.getKeyStat();
        if (this.thisKeyStat) {
          this.nowSelectStatName = this.abKeyStat.getKeyStatName();
        } else {
          return
        }

      }

    });

  }

  findBuildStats(exp: Experiment) {
    let buildStatus;
    for (const key in exp.control.flags) {
      if (this.app.typ === AppType.H5) {
        try {
          const flag = JSON.parse(exp.control.flags[key]);
          for (const url in flag) {
            if (flag[url].data) {
              buildStatus = flag[url].data.stats.reduce((names: Array<string>, s) => { names.push(s.statName); return names }, []);
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (this.app.typ === AppType.ANDROID || this.app.typ === AppType.IOS) {
        let flag = { stats: [] };
        try {
          flag = JSON.parse(exp.control.flags[key]);
        } catch (e) {
          flag = { stats: [] };
        }

        buildStatus = (flag.stats || []).reduce((names: Array<string>, s) => { names.push(s.stat_key); return names; }, []);

        // 如果是iOS可视化试验，直接读取stats里的数据
        if (this.app.typ === AppType.IOS && this.exp.control.typ === VersionTyp.EXP_TYPE_BUILD) {
          buildStatus = (flag.stats || []).reduce((names: Array<string>, s) => {
            if (s.properties.length != 0) {
              s.properties.map(item => {

                names.push(item.name === "stat_key" ? item.value : null);
              })
            }

            return names;
          }, []);

          // buildStatus = exp.control.stats || [];
        }
      }


    }

    return buildStatus;
  }

  showVersionSelect() {
    this.isShowSelect = true;
  }

  async closeVersionSelect() {
    this.isShowSelect = false;
    const res = await this.apiExp.getExpById(this.exp.id)
    this.exp$.next(new Experiment(res as Experiment));

  }

  newStat(e) {
    e.stopPropagation();

    if (this.curStats.length > 0) {
      const lastStat = this.curStats[this.curStats.length - 1];
      if (!lastStat || lastStat.isNew) {
        return;
      }
    }
    const newStat = new Stat({
      app_id: this.app.id,
      isNew: true
    });

    this.curStats.push(newStat);

  }

  delItem(stat) {
    const index = this.curStats.findIndex(s => s.name === stat.name);
    if (index > -1) {
      this.curStats.splice(index, 1);
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

  getCurStatNames() {

    return this.curStats.reduce((sum: Array<string>, item: Stat) => {

      sum.push(item.name);

      return sum;
    }, []);
  }

  getAllStatNames() {
    let names = [];
    const statNames = this.getCurStatNames();
    const comStatNames = this.curComStats.reduce((sum: Array<string>, item: Stat) => {
      sum.push(item.name);
      return sum;
    }, []);
    names = names.concat(statNames);
    names = names.concat(comStatNames);
    return names;
  }

  async upStatForExpRelation(stats: Array<string>) {
    const vss = this.exp.getVersions();
    vss.map(v => v.stats = stats);
    const result = await this.apiExp.updateExpWithVersions(this.exp.id, vss)
    this.exp.setVersions(vss);
    this.exp$.next(this.exp);

  }

  async asyncStat(stat: Stat) {
    stat.app_id = this.app.id;

    const res = await this.apiData.updateStat(this.app.id, stat);

    this.stats.push(res as Stat);
  }

  saveKeyStat(statname: string) {

    if (this.exp.id) {
      this.apiData.setKeyStat(this.exp.id, statname).then(res => {
        if (res['error_code']) {
          this.toastrService.error(res['reason_display']);
          return
        }
        this.abKeyStat.setKeyStat(undefined)
        this.abKeyStat.setKeyStatName(undefined);

        this.apiData.getKeyStat(this.exp.id).then(res => {
          if (!res['error_code']) {
            this.nowSelectStatName = res['result']['indicators'];
          }

        })
      })
    } else {

      const savestat = this.curStats.filter(stat => stat.name === statname);
      if (savestat.length != 0) {
        this.abKeyStat.setKeyStat(savestat[0]);
        this.abKeyStat.setKeyStatName(statname);
        this.nowSelectStatName = statname;
      }

    }


  }

  setCreateKeyStat($event) {

    this.ifNewKeyStat = $event
    if ($event) {
      this.abKeyStat.setKeyStat(undefined)
      this.abKeyStat.setKeyStatName(undefined);
      this.nowSelectStatName = undefined
    }


  }

  saveItem(stat: Stat) {
    const isExist = this.allStats.find(s => s.name === stat.name);

    if (!isExist) {
      this.asyncStat(stat);
    }

    const isCurExist = this.curStats.filter(s => s.name === stat.name).length >= 2 ? true : false;

    if (isCurExist) {
      const index = this.curStats.findIndex(c => c.name === stat.name);

      if (index > -1) {

        this.curStats.splice(index, 1);
      }
      const txt = this.translate.instant('codestat.notrepeat');
      return this.toastrService.error(txt);
    }

    const statNames = this.getAllStatNames();

    if (this.exp.id && !this.thisKeyStat) {// 有expid并且没有有关键指标

      this.apiData.setKeyStat(this.exp.id, stat.name).then(res => {
        if (res['error_code']) {
          this.toastrService.error(res['reason_display']);
          return
        }
        this.abKeyStat.setKeyStat(undefined)
      })
      this.upStatForExpRelation(statNames);
    } else if (this.exp.id && this.thisKeyStat) {// 有expid并且有关键指标

      if (this.ifNewKeyStat) {
        this.apiData.setKeyStat(this.exp.id, stat.name).then(res => {
          if (res['error_code']) {
            this.toastrService.error(res['reason_display']);
            return
          }
          this.abKeyStat.setKeyStat(undefined)
        })
      }
      this.upStatForExpRelation(statNames);
    } else {
      if (this.ifNewKeyStat) {
        const savestat = this.curStats.filter(item => item.name === stat.name);
        if (savestat.length != 0) {
          this.abKeyStat.setKeyStat(savestat[0]);
          this.abKeyStat.setKeyStatName(stat.name);
          this.nowSelectStatName = stat.name;
        }
      }
      this.upStatForExpRelation(statNames);
      this.exp.control.stats = statNames;
      this.exp.experiments.map(v => v.stats = statNames);
      this.exp$.next(this.exp);
    }

  }


  goEdit() {
    if (this.app.typ === AppType.H5 && this.exp.typ === VersionTyp.EXP_TYPE_BUILD) {
      this.goH5EditAddStat();
    }

    if (this.app.typ === AppType.ANDROID) {
      this.router.navigate(['/', 'edit', 'android']);
    }


    if (this.app.typ === AppType.IOS) {
      this.router.navigate(['/', 'edit', 'ios']);
    }
  }

  async updateH5Data() {
    const res = await this.apiExp.getExpById(this.exp.id);
    this.exp$.next(new Experiment(res as Experiment));

  }

  goH5EditAddStat() {
    const urldata = JSON.parse(this.exp.control.annotation['urls'])[0].url;
    const tab = window.open('about:blank', '_blank');
    const url = encodeURIComponent(urldata);
    const redirectURL = this.apih5.openSdk({
      url: url,
      authkey: this.token.getToken(),
      appid: this.app.id,
      groupid: this.exp.id,
      expid: this.exp.control.id,
      appkey: this.app.app_key
    });
    const self = this;
    this.ab.binWindowClose(tab, () => {
      self.updateH5Data();
    });
    tab.location.href = redirectURL;
  }

}
