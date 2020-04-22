import { AbstractControl , FormControl , ValidatorFn} from '@angular/forms';



export function URLValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
      const name = control.value;
      if (!name) {
        return null;
      }
      const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(name) ? null : { 'url': true };
    };
}

export function URLRepeatValidator(equalArray: Array<Object>, regexpArray: Array<Object>, jsregexpArray: Array<Object>): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
    const url = control.value.replace(/\s/g, '');
    let equalResult: Boolean = false;
    let expregResult: Boolean = false;
    let jsregexpResult: Boolean = false;

    if (!url) {
      return null;
    }

    /**
     * 逐一判断别的完全匹配试验的url
     * 因为都是完全匹配，所以直接 === 判断
     */
    if (equalArray) {
      equalResult =  equalArray.some(item => {
        /*
         *console.log(clearParams(item['url']), clearParams(url), '213');
         */
        return item['url'] === url;
      })
    }
    /**
     * 逐一判断别的模糊匹配试验的url
     * 每次输入，都尝试匹配其他每一个符合条件的试验中的正则
     */
    if (regexpArray) {
      expregResult = regexpArray.some(item => {
        const reg = new RegExp( (item['regexp']).replace('?', '\\?').replace(/\*/g,'\\S*') + '$'  );
        return reg.test(url)
      });
    }

    if (jsregexpArray) {
      jsregexpResult = jsregexpArray.some(item => {
        const reg = new RegExp(item['regexp']);
        return reg.test(url);
      });
    }

    if (equalResult) {
      return {'repeat' : true};
    } else if (expregResult) {
      return {'repeat': true};
    } else if (jsregexpResult) {
      return {'repeat': true};
    }
    return null;
  }
}




export function RegExpRepeatValidator(equalArray:Array<Object>, regexpArray:Array<Object>, jsregexpArray: Array<Object>): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
    const regStr = control.value.replace(/\s/g, '');
    let equalResult: Boolean = false;
    let expregResult: Boolean = false;
    let jsregexpResult: Boolean = false;

    if (!regStr) {
      return null
    } 

    const reg = new RegExp( regStr.replace('?', '\\?').replace(/\*/g,'\\S*') + '$'  );
    /**
     * 每一次输入，将本url先转化成正则
     * 每一次都匹配每一个其他完全匹配的试验的url
     */
    if(equalArray){
      equalResult =  equalArray.some(item => {
        return reg.test(item['url'])
      })
    }

    /**
     * 因为其他模糊匹配的试验的试验页面的链接都满足该模糊试验的正则
     * 所以当前试验的正则只匹配其他模糊试验的试验页面的链接
     */
    if(regexpArray){
      expregResult = regexpArray.some(item => {
        return reg.test(item['url'])
      })
    }

    if (jsregexpArray) {
      jsregexpResult = jsregexpArray.some(item => {
        return reg.test(item['url']);
      });
    }
  
    if (equalResult) {
      return {'repeat' : true};
    } else if (expregResult) {
      return {'repeat': true};
    } else if (jsregexpResult) {
      return {'repeat': true};
    }
    return null;
  }
}



export function URLMatchRepeatValidator(expAry: Array<Object>): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
    const url = control.value.replace(/\s/g, '');

    if (!url) {
      return null;
    }

    const result = expAry.map(exp => {
      if ( !exp['control'] || !exp['control']['annotation'] || !exp['control']['annotation']['urls']) {
        return false;
      }
      const data = exp['control']['annotation']['urls'];
      const item = JSON.parse(data)[0];
      if (item['mode'] === 'equal') {
        return item['url'] === url;
      }
      if (item['mode'] === 'regex') {
        return (new RegExp((item['regexp'].replace('?', '\\?').replace(/\*/g, '\\S*') + '$'))).test(url);
      }
      if (item['mode'] === 'jsregexp') {
        return (new RegExp(item['regexp'])).test(url);
      }
      return false;
    });

    return result.indexOf(true) > -1 ? {'repeat': true} : null;
  }
}

export function RegexpMatchRepeatValidator(expAry: Array<Object>): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {

    const regexp = new RegExp(control.value.replace('?', '\\?').replace(/\*/g, '\\S*') + '$'  ); 

    if (!regexp) {
      return null;
    }

    const result = expAry.map(exp => {
      if ( !exp['control'] || !exp['control']['annotation'] || !exp['control']['annotation']['urls']) {
        return false;
      }
      const data = exp['control']['annotation']['urls'];
      const item = JSON.parse(data)[0];
      return regexp.test(item['url']);
    });

    return result.indexOf(true) > -1 ? {'repeat': true} : null;
  }
}

export function jsRegexpMatchRepeatValidator(expAry: Array<Object>): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {
    if (!control.value) {
    return {'required': true};
    }
    let regexp;
    try {
     regexp = new RegExp(control.value);
    } catch (e) {
      return {'regexpformat': true};
    }


    if (!regexp) {
      return null;
    }

    const result = expAry.map(exp => {
      if ( !exp['control'] || !exp['control']['annotation'] || !exp['control']['annotation']['urls']) {
        return false;
      }
      const data = exp['control']['annotation']['urls'];
      const item = JSON.parse(data)[0];
      return regexp.test(item['url']);
    });

    return result.indexOf(true) > -1 ? {'repeat': true} : null;
  }
}


export function jsRegexpMatchURLValidator(mode): ValidatorFn {
  return (control: FormControl): {[key: string]: any} => {

    if (!control.parent) {
      return {'regexpformat': true};
    }
    const url = control.parent.controls['url'].value;
    if (!control.value || !url) {
      return {'regexpformat' : true};
    }
    let regexp;
    try {
      if (mode === 'regexp') {
        regexp = new RegExp(control.value.replace('?', '\\?').replace(/\*/g, '\\S*') + '$'); 
      } else {
       regexp = new RegExp(control.value);
      }
    } catch (e) {
      return {'regexpformat': true};
    }

    return regexp.test(url) ? null : {'regexpMatch': true};
    }

    }
