import { TestBed, inject } from '@angular/core/testing';

import { CurAppService } from './cur-app.service';

describe('CurAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurAppService]
    });
  });

  it('should be created', inject([CurAppService], (service: CurAppService) => {
    expect(service).toBeTruthy();
  }));
});
