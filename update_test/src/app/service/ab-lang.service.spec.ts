import { TestBed } from '@angular/core/testing';

import { AbLangService } from './ab-lang.service';

describe('AbLangService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AbLangService = TestBed.get(AbLangService);
    expect(service).toBeTruthy();
  });
});
