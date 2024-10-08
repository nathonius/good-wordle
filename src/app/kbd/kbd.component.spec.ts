import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbdComponent } from './kbd.component';

describe('KbdComponent', () => {
  let component: KbdComponent;
  let fixture: ComponentFixture<KbdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KbdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
