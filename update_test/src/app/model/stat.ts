export const PV_STAT_NAME = 'Event-GET_EXPERIMENT_FLAGS';

export class Stat {
  app_id: string;
  name: string;
  description: string;
  formula: string;
  status: number;
  isEdit: boolean;
  isNew: boolean;
  isBuild: boolean;

  constructor(options?: Object) {
    this.status = 0;
    this.formula = '';
    this.isEdit = false;
    this.isNew = false;
    Object.assign(this, options);
  }

  isComStat() {
    return this.formula ? true : false;
  }


  toJson() {
    const json = {
      app_id: this.app_id,
      name: this.name,
      formula: this.formula,
      description: this.description || '',
      status: this.status
    };
    return JSON.stringify(json);
  }
}

