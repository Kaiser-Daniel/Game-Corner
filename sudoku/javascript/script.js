
var sudoku;
var incomplete;
var boxes;
var sudokuSize;
var moves = 7777;
var digits = [];

function send() {
    var diff = document.forms.sudoku.difficulty.value;
    sudokuSize = document.forms.sudoku.size.value;
    generate(diff, sudokuSize);
} 

function generate(diff, size) {
    moves = 7777;
    sudoku = Array.from({length: size}, () => Array.from({length: size}, () => 0));
    incomplete = Array.from({length: size}, () => Array.from({length: size}, () => 0));
    boxes = Math.sqrt(size);
    sudokuSize = size;
    

    var shuffle = [];

    if(size == 25) {
        document.getElementById("sudoku_container").classList.add("xl");
        document.getElementById("sudoku_container").classList.remove("l");
        document.getElementById("sudoku_container").classList.remove("m");
    } if(size == 16) {
        document.getElementById("sudoku_container").classList.add("l");
        document.getElementById("sudoku_container").classList.remove("xl");
        document.getElementById("sudoku_container").classList.remove("m");
    } if(size == 9) {
        document.getElementById("sudoku_container").classList.add("m");
        document.getElementById("sudoku_container").classList.remove("xl");
        document.getElementById("sudoku_container").classList.remove("l");
    }
    
    digits = [];

    for(i = 0; i<size; i++) {
        var rand = Math.floor(Math.random()*size)+1;
        while(shuffle.includes(rand)) {
            rand = Math.floor(Math.random()*size)+1;
        }
        shuffle.push(rand);
        digits.push(char(i+1));
        console.log(digits);
    }
    
    var num = 0;
    for(x=0; x<size; x++) {
        num = x%boxes*boxes+Math.floor(x/boxes);
        for(y=0; y<size; y++) {
            if(num>=boxes*boxes) {
                num-=boxes*boxes;
            }
            sudoku[x][y] = shuffle[num];
            num++;
        }
    }

    moves *= boxes;
    moves += boxes*boxes;

    for(;moves>0; moves--) {
        var rand = Math.floor(Math.random()*4);
        var one, two, boxOne, boxTwo;

        switch (rand) {
            case 3:
                one = Math.floor(Math.random()*boxes*boxes);
                two = Math.floor(one/boxes)*boxes+Math.floor(Math.random()*boxes);

                rowSwap(one, two);
                break;
            case 2:
                one = Math.floor(Math.random()*boxes*boxes);
                two = Math.floor(one/boxes)*boxes+Math.floor(Math.random()*boxes);

                columnSwap(one, two);
                break;
            case 1:
                boxOne = Math.floor(Math.random()*boxes);
                boxTwo = Math.floor(Math.random()*boxes);
                
                boxRowSwap(boxOne, boxTwo);
                break;
            case 0:
                boxOne = Math.floor(Math.random()*boxes);
                boxTwo = Math.floor(Math.random()*boxes);

                boxColumnSwap(boxOne, boxTwo);
                break;
            default:
                break;
        }
    }

    for(var swaps = boxes*boxes*boxes; swaps>0; swaps--) {
        one = Math.floor(Math.random()*100)%boxes;
        two = Math.floor(Math.random()*100)%boxes;

        boxRowSwap(one, two);

        one = Math.floor(Math.random()*100)%boxes;
        two = Math.floor(Math.random()*100)%boxes;

        boxColumnSwap(one, two);
    }

    unfilled(diff);

    var target = document.getElementById("sudoku_container");
    target.innerHTML = "";

    var table = document.createElement("table");
    for(x=0; x<size; x++) {
        var row = document.createElement("tr");
        for(y=0; y<size; y++) {
            var cell = document.createElement("td");
            if(incomplete[x][y]>0) {
                number = incomplete[x][y];
                var symbol = char(number);
                cell.innerHTML = symbol;
            } if(y%boxes==0 && y!=0) {
                cell.classList.add("left_border");
            } if(x%boxes==0 && x!=0) {
                cell.classList.add("top_border");
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    target.appendChild(table);

    var cells = document.querySelectorAll("td");

    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            if(cell.innerHTML.trim() === "") {
                var input = document.createElement("input");
                input.type = 'text';
                input.maxLength = 1;
                input.addEventListener("input", fill);
                cell.appendChild(input);
                input.focus();

                input.addEventListener('blur', () => {
                    const value = input.value.trim();
                    const row = input.parentNode.parentNode.rowIndex;
                    const col = cell.cellIndex;

                    if(digits.includes(value)) {
                        var valid = check(row, col, value);
                        if(valid) {
                            fill(cell, value);
                        } else {
                            cell.removeChild(input);
                        }
                    } else {
                        cell.removeChild(input);
                    }
                });
            }
        });
    })
}

function boxRowSwap(firstBoxRow, secondBoxRow) {
    if(firstBoxRow>=boxes||secondBoxRow>=boxes) {
        console.error("Outside bounds:", firstBoxRow,secondBoxRow, boxes);
        firstBoxRow = firstBoxRow%boxes;
        secondBoxRow = secondBoxRow%boxes;
        console.log(firstBoxRow, secondBoxRow);
    } for(i = 0; i<boxes; i++) {
        var first = firstBoxRow*boxes + i;
        var second = secondBoxRow*boxes + i;
        for(j = 0; j<boxes*boxes; j++) {
            var swapee = sudoku[first][j];
            sudoku[first][j] = sudoku[second][j];
            sudoku[second][j] = swapee;
        }
    }
}

function boxColumnSwap(firstBoxColumn, secondBoxColumn) {
    if(firstBoxColumn>=boxes||secondBoxColumn>=boxes) {
        console.error("Outside bounds:", firstBoxColumn,secondBoxColumn, boxes);
        firstBoxColumn = firstBoxColumn%boxes;
        secondBoxColumn = secondBoxColumn%boxes;
        console.log(firstBoxColumn, secondBoxColumn);
    } for(i = 0; i<boxes; i++) {
        var first = firstBoxColumn*boxes + i;
        var second = secondBoxColumn*boxes + i;
        for(j = 0; j<boxes*boxes; j++) {
            var swapee = sudoku[j][first];
            sudoku[j][first] = sudoku[j][second];
            sudoku[j][second] = swapee;
        }
    }
}

function rowSwap(one, two) {
    if(Math.floor(one/boxes) != Math.floor(two/boxes)) {
        throw console.error("Different boxes");
    } for(i = 0; i<boxes*boxes; i++) {
        var swapee = sudoku[one][i];
        sudoku[one][i] = sudoku[two][i];
        sudoku[two][i] = swapee;
    }
}

function columnSwap(one, two) {
    if(Math.floor(one/boxes) != Math.floor(two/boxes)) {
        throw console.error("Different boxes");
    } for(i = 0; i<boxes*boxes; i++) {
        var swapee = sudoku[i][one];
        sudoku[i][one] = sudoku[i][two];
        sudoku[i][two] = swapee;
    }
}

function unfilled(diff) {
    var nbDigits = boxes*boxes*boxes*boxes;
    var show = nbDigits-diff*(boxes+5);
    for(;show>0;show--) {
        var x = Math.floor(Math.random()*boxes*boxes);
        var y = Math.floor(Math.random()*boxes*boxes);
        incomplete[x][y] = sudoku[x][y];
    }
}

function char(number) {
    var symbol;
    switch (number) {
        case 25:
            symbol = 'P';
            break;
        case 24:
            symbol = 'O';
            break;        
        case 23:
            symbol = 'N';
            break;
        case 22:
            symbol = 'M';
            break;
        case 21:
            symbol = 'L';
            break;
        case 20:
            symbol = 'K';
            break;
        case 19:
            symbol = 'J';
            break;
        case 18:
            symbol = 'I';
            break;
        case 17:
            symbol = 'H';
            break;
        case 16:
            symbol = 'G';
            break;
        case 15:
            symbol = 'F';
            break;
        case 14:
            symbol = 'E';
            break;
        case 13:
            symbol = 'D';
            break;
        case 12:
            symbol = 'C';
            break;
        case 11:
            symbol = 'B';
            break;
        case 10:
            symbol = 'A';
            break;
        case 9:
            symbol = '9';
            break;
        case 8:
            symbol = '8';
            break;
        case 7:
            symbol = '7';
            break;
        case 6:
            symbol = '6';
            break;
        case 5:
            symbol = '5';
            break;
        case 4:
            symbol = '4';
            break;
        case 3:
            symbol = '3';
            break;
        case 2:
            symbol = '2';
            break;
        case 1:
            symbol = '1';
            break;

        default:
            break;
    }

    return symbol;
}

function reverse(number) {
    var num;
    switch (number) {
        case 'P':
            num = 25;
            break;
        case 'O':
            num = 24;
            break;
        case 'N':
            num = 23;
            break;
        case 'M':
            num = 22;
            break;
        case 'L':
            num = 21;
            break;
        case 'K':
            num = 20;
            break;
        case 'J':
            num = 19;
            break;
        case 'I':
            num = 18;
            break;
        case 'H':
            num = 17;
            break;
        case 'G':
            num = 16;
            break;
        case 'F':
            num = 15;
            break;
        case 'E':
            num = 14;
            break;
        case 'D':
            num = 13;
            break;
        case 'C':
            num = 12;
            break;
        case 'B':
            num = 11;
            break;
        case 'A':
            num = 10;
            break;
        case '9':
            num = 9;
            break;
        case '8':
            num = 8;
            break;
        case '7':
            num = 7;
            break;
        case '6':
            num = 6;
            break;
        case '5':
            num = 5;
            break;
        case '4':
            num = 4;
            break;
        case '3':
            num = 3;
            break;
        case '2':
            num = 2;
            break;
        case '1':
            num = 1;
            break;
        default:
            break;
    }
    return num;
}

function fill(cell, value) {
    cell.innerHTML = value;
}

function check(x, y, num) {
    num = reverse(num);
    if(num>sudokuSize || num==NaN || num=="") {
        console.log("false");
        return false;
    }
    var solution = copy(incomplete);
    var valid = solveSudoku(x, y, num, solution);
    if(valid) {
        incomplete[x][y] = num;
    }
    return valid;
}

function copy(to_copy) {
    var clone = [];
    for(var x = 0; x<sudokuSize; x++) {
        var row = [];
        for(var y = 0; y<sudokuSize; y++) {
            row.push(to_copy[x][y]);
        }
        clone.push(row);
    }
    return clone;
}

function solveSudoku(x, y, num, incomplete) {
    if(valid(x, y, num, incomplete)) {
        incomplete[x][y] = num;
        const solved = solve(0, 0, sudokuSize,incomplete);
        return solved;
    }
    return false;
}

// This function was made by ChatGPT.
function solve(row, col, size, puzzle) {
    if(row == size) {
        return true;
    }

    let nextRow, nextCol;
    if(col===size-1) {
        nextRow = row+1;
        nextCol = 0;
    } else {
        nextRow = row;
        nextCol = col+1;
    }

    if(puzzle[row][col] !== 0) {
        return solve(nextRow, nextCol, size, puzzle);
    }

    for(let val = 1; val <= size; val++) {
        if(valid(row, col, val, puzzle)) {
            puzzle[row][col] = val;
            if(solve(nextRow, nextCol, size, puzzle)) {
                return true;
            }
            puzzle[row][col] = 0;
        }
    }
    return false;
}

function valid(x, y, num, solution) {
    return checkRow(x, num, solution) && checkColumn(y, num, solution) && checkBox(x, y, num, solution);
}

function checkRow(x, num, solution) {
    var row = solution[x];
    if(row.includes(num)) {
        return false;
    }
    return true;
}

function checkColumn(y, num, solution) {
    var column = [];

    for(i = 0; i<sudokuSize; i++) {
        column[i] = solution[i][y];
    }
    if(column.includes(num)) {
        return false;
    }

    return true;
}

function checkBox(x, y, num, solution) {
    x = Math.floor(x/boxes);
    y = Math.floor(y/boxes);
    var boxX;
    var boxY;
    for(i = 0; i<boxes; i++) {
        boxX = x*boxes + i;
        for(j = 0; j<boxes; j++) {
            boxY = y*boxes + j;
            if(solution[boxX][boxY] == num) {
                return false;
            }
        }
    }
    return true;
}