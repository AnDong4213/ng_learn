import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from './auth-guard.service';
import { AuthService } from '../service/auth.service';
import { TokenService } from '../service/token.service';
import { ApiAuth } from 'adhoc-api';

describe('AuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpModule],
      providers: [AuthGuard, TokenService, ApiAuth, AuthService]
    });
  });

  it('should be created', inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));
});
