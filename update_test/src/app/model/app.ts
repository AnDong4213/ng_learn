// group级别下 接口类型是 string
export const LPO_TYPE = 'LPO';
// app级别下接口 类型 number
export const LPO_TYP = 11;
export const APP_TYPE_H5 = 5;
export const APP_TYPE_ANDROID = 6;
export const APP_TYPE_IOS = 7;
export const APP_TYPE_WX = 8;
export const APP_TYPE_DEF = 0;
export const APP_TYPE_LPO = 12;
export const AppType = {
  LPO: 12,
  H5: 5,
  ANDROID: 6,
  IOS: 7,
  WX: 8,
  DEF: 0,
};

export class App {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  typ: number;
  author_id: string;
  app_key: string;
  deleted: boolean;
  created_at: number;

  constructor(options?: Object) {
    this.typ = APP_TYPE_DEF;
    this.deleted = false;
    this.description = '';
    this.url = '';
    this.logo = '';
    Object.assign(this, options);
  }

}

