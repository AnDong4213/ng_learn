import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { ApiAuth } from 'adhoc-api';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [TokenService, ApiAuth, AuthService] 
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
