import { TestBed } from '@angular/core/testing';

import { SimpleToastService } from './simple-toast.service';

describe('SimpleToastService', () => {
  let service: SimpleToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
