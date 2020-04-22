import { AbstractControl , FormControl , ValidatorFn} from '@angular/forms';

export function FormulaValidator(app, stat, isH5): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
      const val = control.value;
      if (!val) {
        return {'formula': true};
      }
      const tempStats = val.match(/([^-+*/\d/\s()\[\]{}@$#%&、~!]([\w\d]*))/g);
      const tempOperator = val.search(/[^\w \d\+\-\*\/\(\)\.]/);
      if (tempOperator !== -1) {
        return {'formula': true};
      }
      if (!tempStats) {
        return {'formual': true};
      }
      let allStats = {};
      const InvalidStats = [];
      allStats = stat;

      if (app.typ === isH5) {
        allStats['PV'] = { name: 'EVENT_GET_FLAGS', description: '', status: 0, formula: '' };
      }
      //allStats['UV'] = { name: 'UV', description: '', status: 0, formula: '' };

      tempStats.forEach(function (sname) {
        if (!allStats.hasOwnProperty(sname)) {
          InvalidStats.push(sname);
        }
      });

      if (tempStats.length > 2) {
        return {'maxstat' : true } ;
      }

      if (InvalidStats.length !== 0) {
        return {'stat': true};
      }
      return null;
    };
}

