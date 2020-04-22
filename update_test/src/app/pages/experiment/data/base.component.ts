import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Version, Experiment } from '../../../model';

import { ApiExperiment, ApiData } from 'adhoc-api';
import { AbLodash } from '../../../service/ab-lodash.service';
import { ABService } from '../../../service/ab.service';
import { CurAppService } from '../../../service/cur-app.service';


export const STAT_TYPE_UV = 'uv';
export const STAT_TYPE_UV_MEAN = 'uv_mean';
export const STAT_TYPE_SUM = 'sum';
export const STAT_TYPE_MEAN = 'mean';

export class DataBase implements OnInit {
  @Input() expid;
  route: ActivatedRoute;
  apiData: ApiData;
  _: AbLodash;
  ab: ABService;
  apiExp: ApiExperiment;
  curAppService: CurAppService;


  appid: string; exp: Experiment;
  control: Version;
  versions: Array<Version>;
  statResult: Object;
  clientResult: Object;
  isActivation = false;

  // index data
  indexClientResult: Object;
  indexStatResult: Object;

  constructor(route: ActivatedRoute,
    apiData: ApiData,
    _: AbLodash,
    ab: ABService,
    curAppService: CurAppService,
    apiExp: ApiExperiment) {

    this.route = route;
    this.apiData = apiData;
    this._ = _;
    this.ab = ab;
    this.apiExp = apiExp;
    this.curAppService = curAppService;
  }

  ngOnInit() {
    const app = this.curAppService.getApp();
    this.appid = app.id;
  }

  getItemKey(key, datakey, id) {
    const stat = this.indexStatResult[key];
    if (!stat) {
      return 0;
    }
    const index = this._.keyBy(stat, 'experiment_id');
    return index[id] && index[id].hasOwnProperty(datakey) ? index[id][datakey] : 0;
  }

  getExp(callback) {
    this.apiExp.getExpById(this.expid).then(res => {
      this.exp = (res as Experiment);

      this.control = new Version(this.exp.control);
      this.versions = this.exp.getVersions();
      return callback();
    });
  }

  getStatResult(callback) {
    this.apiData.getStatResult(this.appid).then(res => {
      this.statResult = res['results'];
      return callback();
    });
  }

  getClientResult(callback) {
    this.apiData.getClientResult(this.appid).then(res => {
      this.clientResult = res['clients'];
      return callback();
    });
  }

  initIndexData() {
    this.indexClientResult = this._.keyBy(this.clientResult, 'experiment_id');
    this.indexStatResult = this._.groupBy(this.statResult, 'stat_key');
  }

  getOutputVar(key, itemid, adapter?) {
    const statResult = this.indexStatResult[key];
    if (!statResult) {
      return 0;
    }
    const index = this._.keyBy(statResult, 'experiment_id');
    const contrlid = this.control.id;
    const itemResult = index[itemid];
    const contralResult = index[contrlid];
    if (!itemResult || !contralResult) {
      return 0;
    }
    if (contralResult.sum === 0) {
      return 0;
    }

    if (adapter) {
      return adapter(contralResult, itemResult);
    }
    return ((itemResult.mean / contralResult.mean) - 1) * 100;
  }

  getOutputCi(key, itemid, adapter?): Object {
    const def = { low: 0, high: 0 };
    const statResult = this.indexStatResult[key];
    if (!statResult) {
      return def;
    }
    const index = this._.keyBy(statResult, 'experiment_id');
    const controlid = this.control.id;

    const itemResult = index[itemid];
    const contralResult = index[controlid];

    if (!this.indexClientResult[itemid] || !this.indexClientResult[controlid]) {
      return def;
    }
    const itemSum = this.indexClientResult[itemid].client_sum;
    const contralSum = this.indexClientResult[controlid].client_sum;

    const alpha = 0.05;
    const multiple = this.versions.length - 1 > 10 ? 10 : this.versions.length - 1;
    let runDay = this.ab.toDay(this.ab.nowTime(), this.control.start_date);
    runDay = this.ab.getMiniKOfZBK(runDay);

    if (!itemResult || !contralResult) {
      return def;
    }
    if (contralResult.sum === 0) {
      return def;
    }
    return this.ab.ci(itemResult, contralResult, itemSum, contralSum, alpha, multiple, runDay, adapter);
  }

  getOutputPowerCi(key, vid, mde, alpha, statType) {
    const def = { low: 0, high: 0 };
    const statResult = this.indexStatResult[key];
    if (!statResult) {
      return def;
    }
    const index = this._.keyBy(statResult, 'experiment_id');
    const controlid = this.control.id;

    let itemResult = index[vid];
    if (!itemResult) {
      itemResult = {
        mean: 0,
        variance: 0
      };
    }
    let controlResult  = index[controlid];
    if (!controlResult) {
      controlResult = {
        mean: 0,
        variance: 0
      }
    }

    if (!this.indexClientResult[vid] || !this.indexClientResult[controlid]) {
      return def;
    }

    const multiple = this.versions.length - 1 > 10 ? 10 : this.versions.length - 1;
    let runDay = this.ab.toDay(this.ab.nowTime(), this.control.start_date);
    runDay = this.ab.getMiniKOfZBK(runDay);
    const newFormula = true;

    const x1 = controlResult.mean;
    const x2 = itemResult.mean;
    const v1 = controlResult.variance;
    const v2 = itemResult.variance;
    const n1 = this.indexClientResult[this.control.id].client_sum;
    const n2 = this.indexClientResult[vid].client_sum;

    let power;
    // 获取置信区间的值
    
    if (statType === STAT_TYPE_UV_MEAN || statType === STAT_TYPE_UV) {
      power = this.calculate_statistical_power(controlResult, itemResult, n1, n2, mde, alpha, false, multiple, runDay, newFormula);
    } else {
      power = this.calculate_statistical_power(controlResult, itemResult, n1, n2, mde, alpha, true, multiple, runDay, newFormula);
    }

    return power;
  }


    phi_cdf (x) {
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


    /*
      getCb_dunnett:
      根据multiple（版本数量）与alpha_level来取 cb_dunnett关键值。
    */
    getCb_dunnett (multiple, alpha_level) {
      /* α = 0.05 时使用的 cb 参数 */
      const cb_dunnett_array_05 = [0, 2.107, 2.336, 2.466, 2.550, 2.616, 2.672, 2.710, 2.748, 2.785, 2.814];

      /* α = 0.01 时使用的 cb 参数 */
      const cb_dunnett_array_01 = [0, 2.678, 2.880, 3.004, 3.080, 3.137, 3.185, 3.224, 3.262, 3.291, 3.320];

      const cb_dunnett_array = alpha_level === 0.05 ? cb_dunnett_array_05 : cb_dunnett_array_01;

      /* multiple 是试验中测试版本的个数，不包括原始版本 */
      const cb_dunnett = cb_dunnett_array[multiple];
      return cb_dunnett;
    }

   calculate_critz (p) {
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

   get_zb_k (zb, K, k, dota) {
        return zb * Math.pow(k / K, dota - 0.5);
    }

  calculate_statistical_power(controlResult, itemResult, n1, n2, mde, alpha, type, multiple, runDay, newFormula) {
    const data = this.assistCountUv(controlResult, itemResult, type);
    const x1 = data['x1'];
    const x2 = data['x2'];
    const v1 = data['v1'];
    const v2 = data['v2'];
    let z_05 = 1.9599651;
    if (alpha !== -1.05 && alpha > 0 && alpha <= 1) {
      z_05 = Math.abs(this.calculate_critz(alpha / 2));
    }
    if (alpha === 0.05 && newFormula || alpha === 0.01 && newFormula) {
      const cb_dunnett = this.getCb_dunnett(multiple, alpha);
      z_05 = this.get_zb_k(cb_dunnett, 14, runDay, 0);
    }
    const deviation = Math.sqrt(v1 / n1 + v2 / n2);
    const delta = Math.abs(x2 - x1);
    const minimum_effect_size = mde || 0.03;

    const ci_value = z_05 * deviation;
    const delta_min = delta - ci_value;
    let z = delta / deviation;
    let z_effect = 0, z_min = 0, effect_size = 0;
    const z_detect = Math.abs(x1 * minimum_effect_size) / deviation;
    let p_value = 1;
    if (alpha === 0.05 && newFormula || alpha === 0.01 && newFormula) {
      const pvalue_notadjusted = this.phi_cdf(-z) * 2;
      // 调整p_value
      const alpha_dunnett = this.phi_cdf(-z_05) * 2;
      if (alpha_dunnett < Number.MIN_VALUE) {
        p_value = 1;
      } else {
        p_value = pvalue_notadjusted * alpha / alpha_dunnett;
      }
      // console.log('p_value',p_value,pvalue_notadjusted,alpha,alpha_dunnett);
      if (p_value > 1) {
        p_value = 1;
      }

    } else {
      p_value = this.phi_cdf(-z) * 2;
    }
    if (p_value >= alpha) {
      effect_size = minimum_effect_size * 100;

      z_min = z_detect;
      z_effect = z_min;
    } else {
      effect_size = Math.sign(x2 - x1) * delta_min * 100 / x1;
      z_min = -z_05 + z;
      z_effect = Math.sign(x2 - x1) * z_min;
    }
    const mpower = this.phi_cdf(-z_05 + z_min) + this.phi_cdf(-z_05 - z_min);
    let power_desc = '';
   
    if (mpower < 0.5) {
      power_desc = '功效不足';
    } else if (mpower < 0.8) {
      power_desc = '功效一般';
    } else if (mpower <= 1) {
      power_desc = '功效足够';
    }

    const d = x2 - x1;
    const low = ((d - ci_value ) / data['x1']) * 100;
    const high = ((d + ci_value ) / data['x1']) * 100;
    let effect_desc = '';
    if (Math.sign(low) === Math.sign(high) && Math.min(Math.abs(low), Math.abs(high)) >= minimum_effect_size * 100) {
      effect_desc = '效果显著';
    } else if (Math.max(Math.abs(low), Math.abs(high)) < minimum_effect_size * 100) {
      effect_desc = '效果不显著';
    } else {
      effect_desc = '效果不确定';
    }
    // console.log('d',d,ci_value,data.x1,z_05,v1,v2,n1,n2);
    z = (x2 - x1) / deviation;
    const po = {
      pvalue: p_value, mpower: mpower, ci_value: ci_value, power_desc: power_desc, effect_desc: effect_desc, effect_size: effect_size,
      zvalue: z, z_effect: z_effect, z_alpha: z_05, z_max: z_05 + z, z_min: -z_05 + z, z_detect: z_detect, ci_low: low, ci_high: high
    };
    return po;
  }


  assistCountUv(controlResult, itemResult, type) {
    const data = {};
    if (type) {
      data['x1'] = controlResult.mean ? controlResult.mean : 0;
      data['x2'] = itemResult.mean ? itemResult.mean : 0;
      data['v1'] = controlResult.variance ? controlResult.variance : 0;
      data['v2'] = itemResult.variance ? itemResult.variance : 0;
    } else {
      data['x1'] = controlResult.uv_mean ? controlResult.uv_mean : -1;
      data['x2'] = itemResult.uv_mean ? itemResult.uv_mean : 0;
      data['v1'] = data['x1'] * (1 - data['x1']);
      data['v2'] = data['x2'] * (1 - data['x2']);
    }
    return data;
  }

  normalDistribution (x, mean, variance) {
    return Math.pow(Math.E, Math.pow(x - mean, 2) / (-2 * variance)) / Math.sqrt(2 * Math.PI * variance);
  }

}

