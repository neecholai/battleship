const { cloneDeep, invert } = require('lodash');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const letterConversion = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
};

const funNoises = [
  'Whipoosh',
  'Splat',
  'Kerplow',
  'Wabang',
  'Kabang',
  'Bazoing',
  'Rabonk',
  'Success',
  'Whippow',
];

class Game {
  constructor() {
    this.board1 = new Board();
    this.board2 = new Board();
    this.player1 = { name: null, userBoard: this.board1, opponentBoard: this.board2 };
    this.player2 = { name: null, userBoard: this.board2, opponentBoard: this.board1 };
    this.activePlayer = this.player1;
    this.initGame();
  }

  initGame() {
    readline.question(`Player 1, What's your name? `, (input) => {
      this.player1.name = input;
      readline.question(`Player 2, What's your name? `, (input) => {
        this.player2.name = input;
        this.promptGuess();
      });
    });
  }
  
  promptGuess() {
    readline.question(
      `${this.activePlayer.opponentBoard.displayBoard()}\n ${
        this.activePlayer.name
      }, Enter your Target Coordinate (A-J, 1-10) in the following format: A-6 \n`,
      (input) => {
        const coordinate = input.split('-');
        let letter = letterConversion[coordinate[0].toUpperCase()];
        let number = +coordinate[1] - 1;
        // if (
        //   !letter ||
        //   number < 0 ||
        //   number > 9 ||
        //   number % 1 !== 0
        // ) {
        //   console.log('Please enter a valid coordinate!');
        //   return this.promptGuess();
        // }
        this.handleGuess(number, letter);
      }
    );
  }

  handleGuess(x, y) {
    const { opponentBoard } = this.activePlayer;
    const { grid } = opponentBoard;
    if (grid[y][x].guess) {
      console.log('Already Guessed - Guess Again');
      return this.promptGuess();
    } else {
      grid[y][x].guess = true;
      if (grid[y][x].ship) {
        opponentBoard.remainingGuesses--;
        const randomNoise = funNoises[Math.floor(Math.random() * funNoises.length)];
        console.log(`${randomNoise}! That's a hit!`);
      } else {
        console.log(`Oops. That's a miss!`);
      }
    }

    if (opponentBoard.remainingGuesses === 0) return this.endGame();
    this.activePlayer = this.activePlayer === this.player1 ? this.player2 : this.player1;
    this.promptGuess();
  }

  endGame() {
    const randomNoise = funNoises[Math.floor(Math.random() * funNoises.length)];
    readline.question(
      `${randomNoise}! ${this.activePlayer.name} WINS! Would you like to play again? Input 'Y / N \n'`,
      (input) => {
        if (input === 'Y') {
          new Game();
        } else if (input === 'N') {
          console.log('RM RF EVERYTHING');
          readline.close();
        }
      }
    );
  }
}

class Board {
  constructor() {
    this.HEIGHT = 10;
    this.WIDTH = 10;
    this.shipLengths = [5, 4, 3, 3, 2];
    this.remainingGuesses = this.shipLengths.reduce((acc, next) => acc + next);
    this.grid = this.createBoard();
  }

  createBoard() {
    let grid = [];

    for (let j = 0; j < this.HEIGHT; j++) {
      let row = [];
      for (let i = 0; i < this.WIDTH; i++) {
        row.push({ ship: false, guess: false });
      }
      grid.push(row);
    }

    for (let shipLength of this.shipLengths) {
      grid = this.placeShip(grid, shipLength);
    }

    return grid;
  }

  placeShip(grid, shipLength) {
    const x = Math.floor(Math.random() * this.WIDTH);
    const y = Math.floor(Math.random() * this.HEIGHT);
    const newGrid = cloneDeep(grid);
    let direction;
    const randomDir = Math.random();
    if (randomDir < 0.25) {
      direction = 'N';
    } else if (randomDir < 0.5) {
      direction = 'S';
    } else if (randomDir < 0.75) {
      direction = 'E';
    } else {
      direction = 'W';
    }

    if (direction === 'N') {
      for (let j = y; j > y - shipLength; j--) {
        if (j < 0 || grid[j][x].ship) return this.placeShip(grid, shipLength);
        newGrid[j][x].ship = true;
      }
    } else if (direction === 'S') {
      for (let j = y; j < y + shipLength; j++) {
        if (j >= this.HEIGHT || grid[j][x].ship) return this.placeShip(grid, shipLength);
        newGrid[j][x].ship = true;
      }
    } else if (direction === 'E') {
      for (let i = x; i < x + shipLength; i++) {
        if (i >= this.WIDTH || grid[y][i].ship) return this.placeShip(grid, shipLength);
        newGrid[y][i].ship = true;
      }
    } else if (direction === 'W') {
      for (let i = x; i > x - shipLength; i--) {
        if (i < 0 || grid[y][i].ship) return this.placeShip(grid, shipLength);
        newGrid[y][i].ship = true;
      }
    }
    return newGrid;
  }

  displayBoard() {
    let display = '\n    [1] ';
    for (let i = 2; i <= this.WIDTH; i++) {
      display += `[${i}] `;
    }
    display += '\n';
    for (let j = 0; j < this.HEIGHT; j++) {
      display += `[${invert(letterConversion)[j]}] `;
      for (let i = 0; i < this.WIDTH; i++) {
        let symbol = ' ';
        if (this.grid[j][i].guess) {
          symbol = this.grid[j][i].ship ? 'X' : 'O';
        }
        display += `[${symbol}] `;
      }
      display += '\n';
    }

    return display;
  }
}

let game = new Game();

// You sunk the battleship
// Restart game properly
