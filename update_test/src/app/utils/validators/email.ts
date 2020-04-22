import { AbstractControl , FormControl , ValidatorFn} from '@angular/forms';

export function emailValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
      const name = control.value;
			if( !name) {
				return null;
			}
      const regexp = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      return regexp.test(name) ? null : { 'email': true };
    };
}

