import { FormControl, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: FormControl): { [key: string]: any } => {
    const phone = control.value;
    if (!phone) {
      return null;
    }
    const regexp = /^1[3578]\d{9}$/;
    return regexp.test(phone) ? null : { 'phone': true };
  };
}
