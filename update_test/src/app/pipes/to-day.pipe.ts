import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toDay'
})
export class ToDayPipe implements PipeTransform {

  transform(value: number, endTime?: any): string {
    const end = endTime ? endTime : Date.now();
    const s = end  - (value * 1000);
    const day = Math.round(s / (1000 * 60 * 60 * 24));
    return day.toString();
  }

}
