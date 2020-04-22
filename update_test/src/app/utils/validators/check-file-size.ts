import { AbstractControl , FormGroup,  ValidatorFn} from '@angular/forms';

export function checkFileSizeValid(size): ValidatorFn {
  return (control: FormGroup): {[key: string]: any} => {
  
      if (!size) {
          return null;
       }
       return { 'exceed': true };
    };
}

