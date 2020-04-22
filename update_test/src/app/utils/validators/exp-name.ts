
import { AbstractControl , FormControl , ValidatorFn} from '@angular/forms';

export function ExpNamelValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
      const name = control.value;
      if (!name) {
        return null;
      }
      const regexp = /^[\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5a-zA-Z0-9_]*$/;
      return regexp.test(name) ? null : { 'expname': true };
    };
}

