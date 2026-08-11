import { TestBed } from '@angular/core/testing';
import { SocialService } from './social.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

describe('SocialService', () => {
  let service: SocialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SocialService,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} }
      ]
    });
    service = TestBed.inject(SocialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});