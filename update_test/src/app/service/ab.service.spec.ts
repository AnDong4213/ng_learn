import { TestBed, inject } from '@angular/core/testing';

import { ABService } from './ab.service';

describe('ABService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ABService]
    });
  });

  it('should be created', inject([ABService], (service: ABService) => {
    expect(service).toBeTruthy();
  }));
});
