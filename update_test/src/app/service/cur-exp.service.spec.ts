import { TestBed, inject } from '@angular/core/testing';

import { CurExpService } from './cur-exp.service';

describe('CurExpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurExpService]
    });
  });

  it('should be created', inject([CurExpService], (service: CurExpService) => {
    expect(service).toBeTruthy();
  }));
});
