import { TestBed } from '@angular/core/testing';

import { SimpleLoadingService } from './simple-loading.service';

describe('SimpleLoadingService', () => {
  let service: SimpleLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
