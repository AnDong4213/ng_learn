import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';

export function CheckInputBlankValidator(): ValidatorFn {
  return (control: FormControl): { [key: string]: any } => {
    const thisValue = control.value;
    if (!thisValue) return null;
    const afterBlank = thisValue.replace(/\s/g, '');

    return afterBlank === '' ? { 'checkblank': true } : null;
  };
}
