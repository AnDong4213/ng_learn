import { Pipe, PipeTransform } from '@angular/core';
import { Experiment } from '../model';

@Pipe({
  name: 'expSort'
})
export class ExpSortPipe implements PipeTransform {

  transform(array: Array<Experiment>, field?: string): any {
    if (!array) {
      return array;
    }
    array.sort((a: Experiment, b: Experiment) => {
      if (a.control.created_at === b.control.created_at) {
        return 0;
      }
      return a.control.created_at < b.control.created_at ? 1 : -1;
    });
    return array;
  }

}
