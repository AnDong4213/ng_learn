import { AbstractControl , FormGroup,  ValidatorFn} from '@angular/forms';

export function pwdRepeatValidator(pwdkey, repwdkey): ValidatorFn {
  return (control: FormGroup): {[key: string]: any} => {
      const pwd = control.controls[pwdkey];
      const repwd = control.controls[repwdkey];
      if (!pwd.value || !repwd.value) {
          return null;
       }
       return pwd.value === repwd.value ? null : { pwdmatch: true };
    };
}

