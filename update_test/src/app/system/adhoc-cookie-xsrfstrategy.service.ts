import { Injectable } from '@angular/core';
import { Http, XSRFStrategy, CookieXSRFStrategy } from '@angular/http';

export function MyXSRFStrategy() {
  return new CookieXSRFStrategy('auth-key', 'auth-key');
}

export const AdhocCookieXSRFStrategy = {
  provide: XSRFStrategy,
  useFactory: MyXSRFStrategy
};

