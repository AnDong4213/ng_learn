import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { ApiAuth, ApiExperiment } from 'adhoc-api';
import { App } from '../model';
import { AbLodash } from '../service/ab-lodash.service';
import { environment } from '../../environments/environment';

const qiniuDomain = 'https://o6p8nieie.qnssl.com';

@Injectable()
export class ABService {

  constructor(
    private apiAuth: ApiAuth,
    private lodash: AbLodash,
    private http: Http,
    private apiExperiment: ApiExperiment) { }


  getGenerateId() {
    function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); } return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }


  ci(itemResult, controlResult, itemClientSum, controlClientSum, alpha, multiple, runDay, adapter?) {
    let data = {
      o: {},
      x1: 0,
      x2: 0,
      v1: 0,
      v2: 0
    };
    if (!adapter) {
      data.o = { sum: itemResult.sum };
      data.x1 = controlResult.mean;

      if (data.x1 === 0 || typeof (data.x1) === 'undefined') {
        return null;
      }

      data.x2 = itemResult.mean;
      data.v1 = controlResult.variance;
      data.v2 = itemResult.variance;
    } else {
      data = adapter(itemResult, controlResult);
    }
    if (!data) {
      return null;
    } else {
      const n1 = controlClientSum;
      const n2 = itemClientSum;
      let z_05 = 1.9599651;

      if (alpha !== 0.05 && alpha > 0 && alpha <= 1) {
        z_05 = Math.abs(this.calculate_critz(alpha / 2));
      }

      if (alpha === 0.05 || alpha === 0.01) {
        const cb_dunnett = this.getCb_dunnett(multiple, alpha);
        if (runDay === 0) { runDay = 1; }
        z_05 = this.get_zb_k(cb_dunnett, 14, runDay, 0);
      }

      const ci_value = z_05 * Math.sqrt(data.v1 / n1 + data.v2 / n2);
      const d = data.x2 - data.x1;
      //console.log(itemResult.stat_key,d,ci_value,data.x1,z_05,data.v1,data.v2,n1,n2,'new');
      return data.o ? {
        low: ((d - ci_value) / data.x1) * 100,
        high: ((d + ci_value) / data.x1) * 100,
        p_value: 0
      } : null;
    }
  }

  getDistinct(itemResult, controlResult) {
    const data = {
      o: {},
      x1: 0,
      x2: 0,
      v1: 0,
      v2: 0
    };
    data.o = itemResult ? { sum: itemResult.uv } : { sum: 0 };
    data.x1 = controlResult ? controlResult.uv_mean : 0;
    if (data.x1 === 0 || typeof (data.x1) === 'undefined') {
      return null;
    }
    data.x2 = itemResult.uv_mean;
    data.v1 = data.x1 * (1 - data.x1);
    data.v2 = data.x2 * (1 - data.x2);
    return data;
  }

  varianceAdapter(controlResult, itemResult) {
    return ((itemResult.uv_mean / controlResult.uv_mean) - 1) * 100;
  }


  calculate_critz(p) {
    const Z_MAX = 6;                    // Maximum ±z value
    const ROUND_FLOAT = 6;              // Decimal places to round numbers
    const Z_EPSILON = 0.000001;     /* Accuracy of z approximation */
    let minz = -Z_MAX;
    let maxz = Z_MAX;
    let zval = 0.0;
    let pval;

    if (p < 0.0 || p > 1.0) {
      return -1;
    }

    while ((maxz - minz) > Z_EPSILON) {
      pval = this.phi_cdf(zval);
      if (pval > p) {
        maxz = zval;
      } else {
        minz = zval;
      }
      zval = (maxz + minz) * 0.5;
    }
    return (zval);
  }


  phi_cdf(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = Math.sign(x);

    x = Math.abs(x) / Math.sqrt(2.0);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.pow(Math.E, -x * x);
    return 0.5 * (1.0 + sign * y);
  }


  toDay(startTime: number, diffTime: number) {
    return Math.floor((startTime - diffTime) / 60 / 60 / 24);
  }

  nowTime() {
    return Math.floor(new Date().getTime() / 1000);
  }

  competitionVersion(versionDatas) {

    const score = {};
    const arr = [];
    Object.keys(versionDatas).forEach((key) => {
      const item = versionDatas[key];
      if (!item.clickCi.hasOwnProperty('low') || !item.clickCi.hasOwnProperty('high')) {
        item.clickCi.low = 0;
        item.clickCi.high = 0;
        score[key] = 0;
      }
      if ((item.clickCi.low < 0 && item.clickCi.high < 0) || (item.clickCi.low > 0 && item.clickCi.high > 0)) {
        score[key] = 0;
        if (item.clickCi.low > 0 && item.clickCi.high > 0) {
          score[key] += 0.5;
          score[key] += item.clickVariance;
        }
        if (item.clickCi.low < 0 && item.clickCi.high < 0) {
          score[key] -= 0.5;
        }
      }

    });
    // to arr
    Object.keys(score).forEach(key => {
      arr.push({
        id: key,
        score: score[key]
      });
    });
    // sort
    arr.sort((a, b) => {
      if (a.score > b.score) {
        return -1;
      }

      if (a.score < b.score) {
        return 1;
      }
      return 0;
    });
    // first is result
    const result = arr[0];
    if (arr.length > 1) {
      return result.id;
    } else {
      return null;
    }

  }


  getCb_dunnett(multiple, alpha_level) {
    /* α = 0.05 时使用的 cb 参数 */
    const cb_dunnett_array_05 = [0, 2.107, 2.336, 2.466, 2.550, 2.616, 2.672, 2.710, 2.748, 2.785, 2.814];

    /* α = 0.01 时使用的 cb 参数 */
    const cb_dunnett_array_01 = [0, 2.678, 2.880, 3.004, 3.080, 3.137, 3.185, 3.224, 3.262, 3.291, 3.320];

    const cb_dunnett_array = alpha_level === 0.05 ? cb_dunnett_array_05 : cb_dunnett_array_01;

    /* multiple 是试验中测试版本的个数，不包括原始版本 */
    const cb_dunnett = cb_dunnett_array[multiple];
    return cb_dunnett;
  }

  get_zb_k(zb, K, k, dota) {
    return zb * Math.pow(k / K, dota - 0.5);
  }


  getMiniKOfZBK(num) {
    if (num > 13) {
      return 14;
    }
    if (num < 0) {
      return 0;
    }
    return num;
  }



  binWindowClose(win, callback) {
    const timer = window.setInterval(function() {
      if (win && win.closed) {
        window.clearInterval(timer);
        // 解决A页面打开窗口B页面接受回调
        // AbDispacher.editorClose();
        return callback();
      }
    }, 500);
  }


}

