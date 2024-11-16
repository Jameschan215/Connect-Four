/*
 ** The GameBoard represents the state of the board
 ** Each square holds a Cell (defined later)
 ** and we expose a dropToken method to be able to add Cells to squares
 */

function GameBoard() {
	const rows = 6;
	const columns = 7;
	const board = [];

	// Create a 2d array that will represent the state of the game board
	// For this 2d array, row 0 will represent the top row and
	// column 0 will represent the left-most column.
	// This nested-loop technique is a simple and common way to create a 2d array.
	for (let i = 0; i < rows; i++) {
		board[i] = [];
		for (let j = 0; j < columns; j++) {
			board[i].push(Cell());
		}
	}

	// This will be the method of getting the entire board that our
	// UI will eventually need to render it.
	const getBoard = () => board;

	// In order to drop a token, we need to find what the lowest point of the
	// selected column is, *then* change that cell's value to the player number
	const dropToken = (column, player) => {
		// Our board's outermost array represents the row,
		// so we need to loop through the rows, starting at row 0,
		// find all the rows that don't have a token, then take the
		// last one, which will represent the bottom-most empty cell
		const availableCells = board
			.filter((row) => row[column].getValue() === 0)
			.map((row) => row[column]);

		/*  when the column is 3,
		 ** availableCells would be like this:
		 **    0   1   2   3   4   5   6
		 **               [ ]
		 **               [ ]
		 **               [ ]
		 **               [ ]
		 **               [ ]
		 **               [ ]  this is the bottom-most one

     ** or like this:
		 **    0   1   2   3   4   5   6
		 **               [ ]
		 **               [ ]
		 **               [ ]
		 **               [ ] this is the bottom-most one
		 **               [o] not included in the array
		 **               [x] not included in the array
		 */

		// If no cells make it through the filter,
		// the move is invalid. Stop execution.
		if (!availableCells.length) return;

		// Otherwise, I have a valid cell, the last one in the filtered array
		const lowestRow = availableCells.length - 1;
		board[lowestRow][column].addToken(player);
	};

	// This method will be used to print our board to the console.
	// It is helpful to see what the board looks like after each turn as we play,
	// but we won't need it after we build our UI
	const printBoard = () => {
		const boardWithCellValues = board.map((row) =>
			row.map((cell) => cell.getValue())
		);
		console.log(boardWithCellValues);
	};

	// Here, we provide an interface for the rest of our
	// application to interact with the board
	return { getBoard, dropToken, printBoard };
}

/*
 ** A Cell represents one "square" on the board and can have one of
 ** 0: no token is in the square,
 ** 1: Player 1's token,
 ** 2: Player 2's token
 */

function Cell() {
	let value = 0;

	// Accept a player's token to change the value of the cell
	const addToken = (player) => {
		value = player;
	};

	// How we will retrieve the current value of this cell through closure
	const getValue = () => value;

	return {
		addToken,
		getValue,
	};
}

/*
 ** The GameController will be responsible for controlling the
 ** flow and state of the game's turns, as well as whether
 ** anybody has won the game
 */
function GameController(
	playerOneName = 'Player One',
	playerTwoName = 'Player Two'
) {
	const board = GameBoard();

	const players = [
		{
			name: playerOneName,
			token: 1,
		},
		{
			name: playerTwoName,
			token: 2,
		},
	];

	let activePlayer = players[0];

	const switchPlayerTurn = () => {
		activePlayer = activePlayer === players[0] ? players[1] : players[0];
	};
	const getActivePlayer = () => activePlayer;

	const printNewRound = () => {
		board.printBoard();
		console.log(`${getActivePlayer().name}'s turn.`);
	};

	const checkWin = (board) => {
		const rows = board.length;
		const cols = board[0].length;
		const token = getActivePlayer().token;
		const directions = [
			[0, 1],
			[1, 0],
			[1, 1],
			[1, -1],
		];

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (board[r][c].getValue() !== token) continue;

				for ([dr, dc] of directions) {
					let count = 0;
					for (let i = 0; i < 4; i++) {
						const rowIndex = r + dr * i;
						const colIndex = c + dc * i;

						if (
							rowIndex >= 0 &&
							rowIndex < rows &&
							colIndex >= 0 &&
							colIndex < cols &&
							board[rowIndex][colIndex].getValue() === token
						) {
							count += 1;
						}
					}
					if (count >= 4) return true;
				}
			}
		}
		return false;
	};

	const checkTie = (board) => {
		const rows = board.length;
		const cols = board[0].length;

		let count = 0;

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (board[r][c].getValue() === 0) {
					count += 1;
				}
			}
		}

		if (count === 0) return true;
		return false;
	};

	const playRound = (column) => {
		// Drop a token for the current player
		console.log(
			`Dropping ${getActivePlayer().name}'s token into column ${column}...`
		);
		board.dropToken(column, getActivePlayer().token);

		/*  This is where we would check for a winner and handle that logic,
        such as a win message. */
		if (checkWin(board.getBoard())) {
			board.printBoard();
			console.log(`${getActivePlayer().name} won!`);
			return;
		} else if (checkTie(board.getBoard())) {
			board.printBoard();
			console.log("No more cells. It's a Tie!");
			return;
		}
		// Switch player turn
		switchPlayerTurn();
		printNewRound();
	};

	// Initial play game message
	printNewRound();

	// For the console version, we will only use playRound, but we will need
	// getActivePlayer for the UI version, so I'm revealing it now
	return {
		playRound,
		getActivePlayer,
	};
}

const game = GameController();
