export class Layer {
  id: string;
  app_id: string;
  name: string;
  description: string;
  typ: number;
  status: number;
  traffic: number;

  constructor(options?) {
    this.description = '';
    this.typ = 0;
    this.status = 0;
    Object.assign(this, options);
  }
}


