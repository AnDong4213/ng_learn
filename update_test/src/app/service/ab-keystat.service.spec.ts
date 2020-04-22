import { TestBed } from '@angular/core/testing';

import { AbKeystatService } from './ab-keystat.service';

describe('AbKeystatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AbKeystatService = TestBed.get(AbKeystatService);
    expect(service).toBeTruthy();
  });
});
