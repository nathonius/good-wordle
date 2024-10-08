import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

enum GuessStatus {
  Wrong = 'x',
  Right = 'y',
  Partial = 'z',
  ActiveGuess = 'a',
  Empty = '_',
}

interface GuessValue {
  value: string;
  status: GuessStatus;
}

type Guess = [GuessValue, GuessValue, GuessValue, GuessValue, GuessValue];

const MAX_ATTEMPTS = 6;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'good-wordle';
  protected GuessStatus = GuessStatus;
  protected readonly word = signal('ghast');
  protected readonly guesses = signal<Guess[]>([]);
  protected readonly board = computed<Guess[]>(() => {
    const guesses = this.guesses();
    const board: Guess[] = [];
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      if (guesses[i]) {
        board.push(guesses[i]);
      } else {
        board.push([
          { value: '', status: GuessStatus.Empty },
          { value: '', status: GuessStatus.Empty },
          { value: '', status: GuessStatus.Empty },
          { value: '', status: GuessStatus.Empty },
          { value: '', status: GuessStatus.Empty },
        ]);
      }
    }
    return board;
  });
  protected readonly currentGuessIndex = computed(
    () => this.guesses().length - 1
  );

  handleLetter(value: string) {
    const currentGuesses = [...this.guesses()];
    let currentGuessIndex = this.currentGuessIndex();
    if (currentGuessIndex === -1) {
      currentGuesses.push([
        { value: '', status: GuessStatus.Empty },
        { value: '', status: GuessStatus.Empty },
        { value: '', status: GuessStatus.Empty },
        { value: '', status: GuessStatus.Empty },
        { value: '', status: GuessStatus.Empty },
      ]);
      currentGuessIndex = 0;
    }
    const currentGuess = [...currentGuesses[currentGuessIndex]];
    let guessValueIndex = currentGuess.findIndex(
      (v) => v.status !== GuessStatus.ActiveGuess
    );

    if (value === 'DEL') {
      const delIndex = Math.max(
        guessValueIndex === -1 ? 4 : guessValueIndex - 1,
        0
      );
      currentGuess[delIndex].value = '';
      currentGuess[delIndex].status = GuessStatus.Empty;
    } else if (value === 'ENTER') {
      if (guessValueIndex === -1) {
        this.guesses.set([
          ...currentGuesses,
          [
            { value: '', status: GuessStatus.Empty },
            { value: '', status: GuessStatus.Empty },
            { value: '', status: GuessStatus.Empty },
            { value: '', status: GuessStatus.Empty },
            { value: '', status: GuessStatus.Empty },
          ],
        ]);
      }
      return;
    } else {
      const setValueIndex = guessValueIndex === -1 ? 4 : guessValueIndex;
      currentGuess[setValueIndex].value = value;
      currentGuess[setValueIndex].status = GuessStatus.ActiveGuess;
    }

    currentGuesses.splice(currentGuessIndex, 1, currentGuess as Guess);
    this.guesses.set(currentGuesses);
  }
}
