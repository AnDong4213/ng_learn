import { Version, VersionStatus } from './version';
import { LPO_TYPE } from './app';

export class Experiment {
  id: string;
  name: string;
  app_id: string;
  annotation: Object;
  description: string;
  download: string;
  control: Version;
  experiments: Array<Version>;
  typ: string;
  is_ai: boolean;
  ai_stat_key: string;
  layer_id: string;
  status: string;

  constructor(options?: Object) {
    this.description = '';
    this.status = VersionStatus.Default;
    this.annotation = new Object();
    this.is_ai = false;
    Object.assign(this, options);
  }

  public get traffic() {
    let traffic = 0;
    traffic += this.control.traffic;
    traffic += this.experiments.reduce((sum, version) => sum += version.traffic, 0);
    return traffic;
  }

  getVersions() {
    let vss = new Array<Version>();
    this.control.isControl = true;
    vss.push(new Version(this.control));
    this.experiments.forEach(item => {
      if (item.status !== VersionStatus.Delete) {
        const iii = item instanceof Version ? item : new Version(item);
        vss.push(iii);
      }
    });
    vss = vss.sort((a, b) => {
      if (a.created_at > b.created_at) {
        return 1;
      }
      if (a.created_at < b.created_at) {
        return -1;
      }
      return 0;
    });
    return vss;
  }

  setVersions(v: Array<Version>) {
    if (!v) {
      return;
    }
    this.control = v.filter(i => i.isControl === true)[0];
    this.experiments = v.filter(i => i.isControl !== true);
  }

  getVersionIds(): Array<String> {
    const arr = new Array<String>();
    arr.push(this.control.id);
    this.experiments.forEach(v => {
      arr.push(v.id);
    });
    return arr;
  }

  toJSON() {
    const e = Object.assign({}, this);
    delete e.control.isEdit;
    delete e.control.isControl;
    e.experiments.map(v => {
      delete v.isEdit;
      delete v.isControl;
    });
    return JSON.stringify(e);
  }

  setAvgTraffic(total) {
    const count = this.getVersions().length;
    const avg = Math.floor((total || 100) / count);
    this.control.traffic = avg;
    this.experiments.map(v => v.traffic = avg);
  }

  setLayerId(id: string) {
    this.layer_id = id;
    this.control.layer_id = id;
    this.experiments.map(v => v.layer_id = id);
  }

  delLayerId() {
    delete this['layer_id'];
    delete this.control['layer_id'];
    this.experiments.map(v => delete v['layer_id']);
  }

}
