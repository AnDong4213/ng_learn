import { AbstractControl , FormControl , ValidatorFn} from '@angular/forms';

export function CheckRepeatValidator(checkData): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
      const name = control.value;
      if(!name) return null;
      let no = true;
      checkData.forEach(data => {
        if (data === name) {
          return no = false;
        }
      });
      
      return no ? null : {'checkrepeat': true} ;
    };
}
