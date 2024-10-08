import { Injectable } from '@angular/core';
import { Game, Guess } from './game.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public loadGame(): Game {
    const savedGameString = window.localStorage.getItem('wordgame');
    if (savedGameString) {
      try {
        const savedGame: Game = JSON.parse(savedGameString);
        if (savedGame.date === new Date().toDateString()) {
          return savedGame;
        }
      } catch (err) {
        // pass, just return todays game
      }
    }
    return {
      guesses: [],
      date: new Date().toDateString(),
    };
  }
  public saveGame(guesses: Guess[]) {
    const game: Game = {
      guesses,
      date: new Date().toDateString(),
    };
    window.localStorage.setItem('wordgame', JSON.stringify(game));
  }
}
