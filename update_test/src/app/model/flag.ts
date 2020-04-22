
export class Flag {

  name: string;
  app_id: string;
  description: string;
  typ: number;
  default_value: string;

  constructor(obj?: Object) {
    this.description = '自动生成flag key';
    this.typ = 0;
    this.default_value = '';
    if (obj) {
      Object.assign(this, obj);
    }
  }

}

