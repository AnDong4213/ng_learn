import { Injectable } from '@angular/core';

@Injectable()
export class AbLodash {

  constructor() { }

  keyBy(array, key: string) {
    const obj = {};
    if (!array) {
      return obj;
    }
    for (let i = 0; i < array.length; i++) {
      obj[array[i][key]] = array[i];
    }
    return obj;
  }

  keyByDay(array, key: string) {
    const obj = {};
    if (!array) {
      return obj;
    }
    for (let i = 0; i < array.length; i++) {
      const keyDate = new Date(array[i][key]);
      const d = keyDate.getDate();
      const dd = d <= 9 ? `0${d}` : d;
      const m = keyDate.getMonth() + 1;
      const mm = m <= 9 ? `0${m}` : m;
      const newkey = `${keyDate.getFullYear()}-${mm}-${dd}`;
      obj[newkey] = array[i];
    }
    return obj;
  }

  keyByHour(array, key: string) {
    const obj = {};
    if (!array) {
      return obj;
    }
    for (let i = 0; i < array.length; i++) {
      const keyDate = new Date(array[i][key]);
      const d = keyDate.getDate();
      const dd = d <= 9 ? `0${d}` : d;
      const m = keyDate.getMonth() + 1;
      const mm = m <= 9 ? `0${m}` : m;
      const newkey = `${keyDate.getFullYear()}-${mm}-${dd} ${keyDate.getHours()}:00`;
      obj[newkey] = array[i];
    }
    return obj;
  }

  groupBy(array, key: string) {
    const obj = {};
    if (!array) {
      return obj;
    }
    for (let i = 0; i < array.length; i++) {
      if (obj[array[i][key]]) {
        obj[array[i][key]].push(array[i]);
      } else {
        obj[array[i][key]] = [array[i]];
      }
    }
    return obj;
  }

  makeDateRangeIndex(startDate: Date, endDate: Date) {
    const arr = [];
    const next = new Date(startDate);
    const last = this.getDateStr(new Date(endDate));
    let i = 0;
    while (this.getDateStr(next) !== last) {
      arr.push(this.getDateStr(next));
      let num = next.getDate();
      next.setDate(++num);
      i++;
      if (i > 1000) {
        return arr;
      }
    }
    arr.push(this.getDateStr(next));
    return arr;
  }

  makeDateTimeRangeIndex(startDate: Date, endDate: Date) {
    const arr = [];
    const next = new Date(startDate);
    const last = this.getDateTimeStr(new Date(endDate));

    let i = 0;
    while (this.getDateTimeStr(next) !== last) {
      arr.push(this.getDateTimeStr(next));
      let num = next.getHours();
      next.setHours(++num);
      i++;
      if (i > 10000) {
        return arr;
      }
    }

    // arr.push(this.getDateTimeStr(next));

    return arr;
  }

  getDateStr(d: Date) {
    const day = d.getDate();
    const daystr = day <= 9 ? `0${day}` : `${day}`;
    const month = d.getMonth() + 1;
    const monthStr = month <= 9 ? `0${month}` : `${month}`;
    return `${d.getFullYear()}-${monthStr}-${daystr}`;
  }

  getDateTimeStr(d: Date) {
    const day = d.getDate();
    const daystr = day <= 9 ? `0${day}` : `${day}`;
    const month = d.getMonth() + 1;
    const monthStr = month <= 9 ? `0${month}` : `${month}`;
    return `${d.getFullYear()}-${monthStr}-${daystr} ${d.getHours()}:00`;
  }

  filter(array: Array<any>, fun) {
    const arr = [];
    array.forEach(i => {
      if (fun(i)) {
        arr.push(i);
      }
    });
    return arr;
  }


  generateUniqueId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }


  deepCopy(o: Object) {
    return JSON.parse(JSON.stringify(o));
  }

  exist(lista: Array<String>, listb: Array<String>): Boolean {
    if (!lista) {
      return false;
    }
    for (let item = 0; item < lista.length; item++) {
      if (listb.indexOf(lista[item]) > -1) {
        return true;
      }
    }
    return false;
  }


}

