import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
    private authService: AuthService) { }

  public canActivate() {

    if (this.authService.isAuth()) {
      return true;
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }

}

