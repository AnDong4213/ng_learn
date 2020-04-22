
export const addParamsToURL = function(url, params) {
  const targetURL = url.indexOf('://') > -1 ? url : 'http://' + url;
  let s = '';

  function paramsstr(params: Object) {
    let str = '';
    str += '?';
    let cur = 0;
    for (const prop in params) {
      cur++;
      str += prop;
      str += '=';
      str += params[prop];
      str += '&';
    }
    return str;
  }

  function cleanLast(s) {
    if (s.indexOf('#') === -1 && s.charAt(s.length - 1) === '&') {
      s = s.substr(0, s.length - 1);
    }
    return s;
  }

  if (targetURL.indexOf('?') > -1) {
    s = targetURL.substr(0, targetURL.indexOf('?'));
    s += paramsstr(params);
    const laststr = targetURL.substr(targetURL.indexOf('?') + 1, targetURL.length);
    s += laststr;
  } else if (url.indexOf('#') > -1) {
    s = targetURL.substr(0, targetURL.indexOf('#'));
    s += paramsstr(params);
    const lasthashstr = targetURL.substr(targetURL.indexOf('#'), targetURL.length);
    s = cleanLast(s);
    s += lasthashstr;
  } else {
    s = url + paramsstr(params);
  }

  s = cleanLast(s);

  return s;
};
