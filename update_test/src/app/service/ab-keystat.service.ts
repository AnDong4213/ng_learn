import { Injectable } from '@angular/core';
import { Stat } from '../model';

@Injectable({
  providedIn: 'root'
})
export class AbKeystatService {
  keystat: Stat;
  keystatname: string;

  constructor() { }

  getKeyStat() {
    return this.keystat
  }
  getKeyStatName() {
    return this.keystatname
  }

  setKeyStatName(name) {
    this.keystatname = name;
  }

  setKeyStat(stat) {
    this.keystat = stat;
  }
}
