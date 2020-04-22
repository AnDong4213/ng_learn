import { Experiment } from './experiment';

export const White_List = '白名单';
export class Audience {
  id: string;
  name: string;
  description: string;
  deleted: boolean;
  conditions: string;
  app_id: string;
  new_conditions: Array<any>;
  isEdit: boolean;

  exps: Array<Experiment>;

  constructor(options?: Object) {
    this.conditions = '';
    this.deleted = false;
    this.description = '';
    this.exps = [];
    this.isEdit = false;
    this.id = '';
    this.name = '';
    Object.assign(this, options);
  }

}
