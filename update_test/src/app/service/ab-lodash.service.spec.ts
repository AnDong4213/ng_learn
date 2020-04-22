import { TestBed, inject } from '@angular/core/testing';

import { AbLodash } from './ab-lodash.service';

describe('AbLodash', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AbLodash]
    });
  });

  it('should be created', inject([AbLodash], (service: AbLodash) => {
    expect(service).toBeTruthy();
  }));
});
