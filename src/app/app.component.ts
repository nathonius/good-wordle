import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
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

const VALID_CHARS = /^[A-Za-z]$/;
const ENTER_VALUES = ['ENTER', 'Enter'];
const DEL_VALUES = ['DEL', 'Clear', 'Backspace', 'Cut', 'Delete', 'Escape'];

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
  protected readonly word = signal('GHAST');
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

  @HostListener('window:keydown', ['$event.key'])
  handleKeydown(key: string) {
    this.handleLetter(key);
  }

  handleLetter(value: string) {
    if (!this.isAllowedKey(value)) {
      return;
    }
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

    if (DEL_VALUES.includes(value)) {
      const delIndex = Math.max(
        guessValueIndex === -1 ? 4 : guessValueIndex - 1,
        0
      );
      currentGuess[delIndex].value = '';
      currentGuess[delIndex].status = GuessStatus.Empty;
    } else if (ENTER_VALUES.includes(value)) {
      if (guessValueIndex === -1) {
        const validatedGuess = this.validateGuess(currentGuess as Guess);
        if (validatedGuess) {
          this.guesses.set([
            ...currentGuesses.slice(0, currentGuessIndex),
            validatedGuess,
            [
              { value: '', status: GuessStatus.Empty },
              { value: '', status: GuessStatus.Empty },
              { value: '', status: GuessStatus.Empty },
              { value: '', status: GuessStatus.Empty },
              { value: '', status: GuessStatus.Empty },
            ],
          ]);
        }
      }
      return;
    } else {
      const setValueIndex = guessValueIndex === -1 ? 4 : guessValueIndex;
      currentGuess[setValueIndex].value = value.toUpperCase();
      currentGuess[setValueIndex].status = GuessStatus.ActiveGuess;
    }

    currentGuesses.splice(currentGuessIndex, 1, currentGuess as Guess);
    this.guesses.set(currentGuesses);
  }

  private isAllowedKey(value: string) {
    return (
      value.match(VALID_CHARS) ||
      ENTER_VALUES.includes(value) ||
      DEL_VALUES.includes(value)
    );
  }

  private validateGuess(guess: Guess): Guess | null {
    const answer = this.word();
    if (
      !guess.every(
        (value) =>
          value.status === GuessStatus.ActiveGuess && value.value.length === 1
      )
    ) {
      return null;
    }
    const guessWord = guess.map((g) => g.value).join('');
    const newGuess = [...guess];

    // Mark successes and wrong values first
    for (const [index, val] of guess.entries()) {
      if (val.value === answer.charAt(index)) {
        newGuess[index].status = GuessStatus.Right;
      } else if (!answer.includes(val.value)) {
        newGuess[index].status = GuessStatus.Wrong;
      } else {
        newGuess[index].status = GuessStatus.Partial;
      }
    }

    // Handle partial matches
    for (const [index, val] of newGuess.entries()) {
      if (val.status === GuessStatus.Partial) {
        const totalCorrectCharCount = this.getCharCount(answer, val.value);
        const guessedCorrectCharCount = newGuess.filter(
          (g) => g.value === val.value && val.status === GuessStatus.Right
        ).length;
        const previousPartialCharCount = newGuess
          .slice(0, index)
          .filter(
            (g) => g.value === val.value && val.status === GuessStatus.Partial
          ).length;
        if (
          guessedCorrectCharCount + previousPartialCharCount >=
          totalCorrectCharCount
        ) {
          newGuess[index].status = GuessStatus.Wrong;
        }
      }
    }

    return newGuess as Guess;
  }

  private getCharCount(value: string, char: string): number {
    return Math.max(value.split(char).length - 1, 0);
  }
}
