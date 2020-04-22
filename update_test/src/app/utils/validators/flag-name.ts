import { AbstractControl , FormControl , ValidatorFn } from '@angular/forms';
import { Experiment, VersionStatus } from '../../../app/model';

export function FlagNamelValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
      const name = control.value;
      if (!name)  {
        return null;
      }
      const regexp = /^[a-zA-Z][\w\d_]*$/;
      const no = regexp.test(name);
      return no ? null : {'flagName': true} ;
    };
}


export function FlagLayerValidator(curExp: Experiment , exps: Array<Experiment>): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
      const name = control.value;
      if (!name)  {
        return null;
      }
      const lid = control.parent.value.layer_id;
      const curLayerId = lid === 'default' ? '' : lid;
      const result = exps.filter(i => {
       return i.status !== VersionStatus.Stop && i.status !== VersionStatus.Default
      }).filter(i => {
        if (!curLayerId) {
          return i.hasOwnProperty('layer_id') ? true : false;
        }else {
          return i.layer_id !== curLayerId;
        }
      });
      if(!result) {
        return null;
      }
      const eq = result.find(r => (Object.keys(r.control.flags) || []).indexOf(name) > -1 );
      return  eq ? {'flagLayer': true} : null;
    };
}
