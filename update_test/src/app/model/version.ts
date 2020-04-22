import { LPO_TYPE } from './app';

export const VersionTyp = {
  EXP_TYPE_CODE: 'Code',
  EXP_TYPE_BUILD: 'Build',
  EXP_TYPE_URL: 'Url'
};

export const VersionStatus = {
  Default: 'NotStart',
  Run: 'Running',
  AutoStop: '2',
  Stop: 'Stopped',
  Publish: 'Published',
  Delete: 'Delete'
};

export const StatusDict = {
  NotStart: 'statusDict.inactive',
  Running: 'statusDict.active',
  Stopped: 'statusDict.stopped',
  Published: 'statusDict.published',
  Delete: 'statusDict.delete'
};

export class Version {
  id: string;
  app_id: string;
  name: string;
  description: string;
  status: string;
  traffic: number;
  start_date: number;
  created_at: number;
  end_date: number;
  flags: Object;
  layer_id: string;
  stats: Array<string>;
  qr_code: string;
  group_id: string;
  typ: string;
  isControl: boolean;
  annotation: Object;
  isEdit: boolean;

  audience_id: string;
  conditions: Array<object>;

  constructor(options?: Object) {
    this.start_date = Math.ceil(new Date().getTime() / 1000);
    this.end_date = Math.ceil(new Date().getTime() / 1000) + (60 * 60 * 24 * 365);
    this.description = '';
    this.traffic = 0;
    this.isControl = false;
    this.flags = {};
    this.isEdit = false;
    this.stats = [];
    this.annotation = new Object();

    this.status = VersionStatus.Default;

    if (options) {
      Object.assign(this, options);
    }
  }


}
