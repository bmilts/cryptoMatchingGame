var Match3 = Match3 || {};

Match3.Board = function(state, rows, cols, blockVariations) {

  // Keep track of variables
  this.state = state;
  this.rows = rows;
  this.cols = cols;
  this.blockVariations = blockVariations;

  //main grid
  this.grid = [];

  var i,j;
  for(i = 0; i < rows; i++) {
    this.grid.push([]);

    for(j = 0; j < cols; j++) {
      this.grid[i].push(0);
    }
  }

  //reserve grid on the top, for when new blocks are needed
  this.reserveGrid = [];

  this.RESERVE_ROW = rows;

  for(i = 0; i < this.RESERVE_ROW; i++) {
    this.reserveGrid.push([]);

    for(j = 0; j < cols; j++) {
      this.reserveGrid[i].push(0);
    }
  }

  // Populate grids
  this.populateGrid();
  this.populateReserveGrid();

};

// Populate base game grid
Match3.Board.prototype.populateGrid = function() {

  // Iterate through all variables and generate a random number
  var i, j, variation;
  for(i = 0; i < this.rows; i++) {
    for(j = 0; j < this.cols; j++) {
      // Generate random occurance
      variation = Math.floor(Math.random() * this.blockVariations) + 1;
      this.grid[i][j] = variation;
    }
  }

  var chains = this.findAllChains();
  if(chains.length > 0){
    this.populateGrid();
  }

};

// Populate reserve grid
Match3.Board.prototype.populateReserveGrid = function() {

  // Iterate through all variables and generate a random number
  var i,j, variation;
  for(i = 0; i < this.RESERVE_ROW; i++) {
    for(j = 0; j < this.cols; j++) {
      // Generate random occurance
      variation = Math.floor(Math.random() * this.blockVariations) + 1;
      this.reserveGrid[i][j] = variation;
    }
  }
};

// Iterate elements in main and reserve grid and display for debugging
Match3.Board.prototype.consoleLog = function() {

  var i, j;
  var newLine = '';

  // Display reserve grid
  var i,j, variation;
  for(i = 0; i < this.RESERVE_ROW; i++) {
    newLine += '\n';
    for(j = 0; j < this.cols; j++) {
      // Show corresponding grid element
      newLine += ' ' + this.reserveGrid[i][j];
    }
  }

  newLine += '\n';

  for(j = 0; j < this.cols; j++){
    newLine += ' -';
  }

  // Display grid
  var i,j, variation;
  for(i = 0; i < this.rows; i++) {
    newLine += '\n';
    for(j = 0; j < this.cols; j++) {
      // Show corresponding grid element
      newLine += ' ' + this.grid[i][j];
    }
  }

  console.log(newLine);
};

// Swapping blocks

Match3.Board.prototype.swap = function(source, target) {
  var temp = this.grid[target.row][target.col];
  this.grid[target.row][target.col] = this.grid[source.row][source.col];
  this.grid[source.row][source.col] = temp;

  // Update position to avoid empty squares
  var tempPosition = {row: source.row, col: source.col};
  source.row = target.row;
  source.col = target.col;

  target.row = tempPosition.row;
  target.col = tempPosition.col;
};

// Check adjacent blocks

Match3.Board.prototype.checkAdjacent = function(source, target){
  var diffRow = Math.abs(source.row - target.row);
  var diffCol = Math.abs(source.col - target.col);

  var isAdjacent = (diffRow == 1 && diffCol === 0) || (diffRow == 0 && diffCol === 1);
  return isAdjacent;
};

// Check if block is in chain (3 in a row)

Match3.Board.prototype.isChained = function(block){
  var isChained = false;
  var variation = this.grid[block.row][block.col];
  var row = block.row;
  var col = block.col

  // Check left
  if(variation == this.grid[row][col-1] && variation == this.grid[row][col-2]){
    isChained = true;
  }

  // Check right
  if(variation == this.grid[row][col + 1] && variation == this.grid[row][col+2]){
    isChained = true;
  }

  // Check if blocks are above
  if(this.grid[row-2]){
    // Check up
    if(variation == this.grid[row - 1][col] && variation == this.grid[row - 2][col]){
      isChained = true;
   }
  }
  
  // Check if blocks are below
  if(this.grid[row+2]){
    // Check Down
    if(variation == this.grid[row + 1][col] && variation == this.grid[row + 2][col]){
      isChained = true;
    }
  }

  // Check centre horizontal
  if(variation == this.grid[row][col-1] && variation == this.grid[row][col+1]){
    isChained = true;
  }

  // Check if blocks are above and below
  if(this.grid[row+1] && this.grid[row-1]){
    // Check centre vertical
    if(variation == this.grid[row+1][col] && variation == this.grid[row-1][col]){
      isChained = true;
    }
  }

  return isChained;

};

// Find all instances of chains
Match3.Board.prototype.findAllChains = function(){
  var chained = [];
  var i,j;

  // Go through grid, locate chains and push to chained array
  for(i = 0; i < this.rows; i++) {
    for(j = 0; j < this.cols; j++) {
      if(this.isChained({row: i, col: j})){
        chained.push({row: i, col: j});
      }
    }
  }

  console.log(chained);
  return chained;
};

// Clear chains
Match3.Board.prototype.clearChains = function(){
  
  // Get blocks that require clearing
  var chainedBlocks = this.findAllChains();

  // Set chained blocks to zero
  chainedBlocks.forEach(function(block){
    this.grid[block.row][block.col] = 0;
    
    // After set to zero kill block object
    this.state.getBlockFromColRow(block).kill();

  }, this);
};

// Drop block in main grid, source set to zero
Match3.Board.prototype.dropBlock = function(sourceRow, targetRow, col){
  
  this.grid[targetRow][col] = this.grid[sourceRow][col];
  this.grid[sourceRow][col] = 0;

  // Drop blocks into place
  this.state.dropBlock(sourceRow, targetRow, col);
};

// Drop block from reserve grid down to main grid, source set to zero
Match3.Board.prototype.dropReserveBlock = function(sourceRow, targetRow, col){
  
  this.grid[targetRow][col] = this.reserveGrid[sourceRow][col];
  this.reserveGrid[sourceRow][col] = 0;

  // Drop reserve blocks into place
  this.state.dropReserveBlock(sourceRow, targetRow, col);
};

// Update the grid to drop new blocks over zero'd out blocks
Match3.Board.prototype.updateGrid = function(){
    var i, j, k, foundBlock;
  
    // Go through all rows from bottom up (Iterate backwards)
    for(i = this.rows - 1; i >= 0; i--) {
      // Iterate normally through columns
      for(j = 0; j < this.cols; j++){
        // If block is equal to zero then go higher to get non-zero
        if(this.grid[i][j] === 0){
          foundBlock = false;

          // climb up in the main grid to top >=0
          for(k = i-1; k >= 0; k--){
            // If the block found is greater than zero then drop it
            if(this.grid[k][j] > 0){
              this.dropBlock(k, i, j);
              foundBlock = true;
              break;
            }
          }

          // If not found block access reserve grid
          if(!foundBlock){
              // climb up in the main grid to top >=0
            for(k = this.RESERVE_ROW - 1; k >= 0; k--){
              // If the block found is greater than zero then drop it
              if(this.reserveGrid[k][j] > 0){
                this.dropReserveBlock(k, i, j);
                break;
              }
            }
        }
      }
    }
  }

  // Repopulate the reserve to be used again
  this.populateReserveGrid();
};







