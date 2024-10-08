import { UpperCasePipe } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Guess, GuessStatus } from '../game.interface';

@Component({
  selector: 'app-kbd',
  standalone: true,
  imports: [UpperCasePipe],
  templateUrl: './kbd.component.html',
  styleUrl: './kbd.component.css',
})
export class KbdComponent {
  public readonly letter = input.required<string>();
  public readonly guesses = input.required<Guess[]>();
  public readonly onLetter = output<string>();
  protected readonly guessStatus = computed(() => {
    const guesses = this.guesses();
    const letter = this.letter();
    let bestStatus: GuessStatus = GuessStatus.Empty;
    for (const guess of guesses) {
      for (const value of guess) {
        if (value.value === letter) {
          if (value.status === GuessStatus.Right) {
            return GuessStatus.Right;
          }
          if (
            value.status === GuessStatus.Partial ||
            (value.status === GuessStatus.Wrong &&
              bestStatus === GuessStatus.Empty)
          ) {
            bestStatus = value.status;
          }
        }
      }
    }
    return bestStatus;
  });
  protected readonly statusClass = computed(() => {
    switch (this.guessStatus()) {
      case GuessStatus.Wrong:
        return 'btn-disabled';
      case GuessStatus.Partial:
        return 'btn-warning';
      case GuessStatus.Right:
        return 'btn-success';
      default:
        return '';
    }
  });
  protected readonly kbdClass = computed(
    () => `btn btn-sm md:btn-md ${this.statusClass()}`
  );
}
