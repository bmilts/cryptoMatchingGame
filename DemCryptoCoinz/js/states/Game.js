var Match3 = Match3 || {};

Match3.GameState = {

  init: function() {
    this.NUM_ROWS = 8;
    this.NUM_COLS = 8;
    this.NUM_VARIATIONS = 6;
    this.BLOCK_SIZE = 35;
    this.ANIMATION_TIME = 200;
  },
  create: function() {

    //game background
    this.background = this.add.sprite(0, 0, 'background');

    // Group to keep all blocks in game
    this.blocks = this.add.group();

    //board model
    this.board = new Match3.Board(this, this.NUM_ROWS, this.NUM_COLS, this.NUM_VARIATIONS);

    // Log the board to debug
    this.board.consoleLog();

    // Draw the board!
    this.drawBoard();

    // ADD TEXT HERE: https://www.udemy.com/phaser-game-development/learn/lecture/3207264#questions
    // MUSIC: https://www.udemy.com/phaser-game-development/learn/lecture/3207238#questions

    // TEST SWAP 

    // var block1 = this.blocks.children[10];
    // var block2 = this.blocks.children[11];

    // this.swapBlocks(block1, block2);

  },
  createBlock: function(x, y, data){
    var block = this.blocks.getFirstExists(false);

    if(!block){
      // Create new block and add to group
      block = new Match3.Block(this, x, y,data);
      this.blocks.add(block);
      // Else block exists reset (set to live state)   
    } else {
      block.reset(x, y, data);
    }

    // Return block if needed for other use
    return block;
  }, 

  // ADD draw instruction function (White box with written instructions)

  drawBoard: function() {
    var i, j, block, square;

    // Transparent black squares to hold coins
    var squareBitmap = this.add.bitmapData(this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    // Similar HTML5 canvas 
    squareBitmap.ctx.fillStyle = '#000';
    // Fill from top corner co-ordinates to complete size
    squareBitmap.ctx.fillRect(0,0, this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);

    // Iterate through board
    for(i = 0; i < this.NUM_ROWS; i++){
      for(j = 0; j < this.NUM_COLS; j++){

        // Move from each column
        x = 36 + j * (this.BLOCK_SIZE + 6);
        y = 150 + i * (this.BLOCK_SIZE + 6);

        square = this.add.sprite(x, y, squareBitmap);
        square.anchor.setTo(0.5);
        square.alpha = 0.2;

        // Add blocks
        this.createBlock(x, y, {asset: 'block' + this.board.grid[i][j], row: i, col: j});
      }
    }

    // Send group of blocks to top
    this.game.world.bringToTop(this.blocks);
  // Get block from column and row to kill
  }, 
  getBlockFromColRow: function(position){
    var foundBlock;

    // Go through all blocks and return 
    this.blocks.forEachAlive(function(block){
      if(block.row === position.row && block.col === position.col){
          foundBlock = block;
      }
    }, this);

    // Return foundBlock to kill
    return foundBlock;
  },
  dropBlock: function(sourceRow, targetRow, col){
    var block = this.getBlockFromColRow({row: sourceRow, col: col});
    var targetY = 150 + targetRow * (this.BLOCK_SIZE + 6);

    // Update sprite
    block.row = targetRow;

    // Tween changes y position for animation
    var blockMovement = this.game.add.tween(block);
    blockMovement.to({y: targetY}, this.ANIMATION_TIME);
    // Start animation
    blockMovement.start();

    // SOUND POINT DROP BLOCKS

  }, // Create and Drop reserve blocks into main 
  dropReserveBlock: function(sourceRow, targetRow, col){
    var x = 36 + col * (this.BLOCK_SIZE + 6);

    // Start according to where source row is (off screen)
    var y = -(this.BLOCK_SIZE + 6) * this.board.RESERVE_ROW + sourceRow * (this.BLOCK_SIZE + 6);

    // Now creating blocks to drop 
    var block = this.createBlock(x, y, {asset: 'block' + this.board.grid[targetRow][col], row: targetRow, col: col});
    var targetY = 150 + targetRow * (this.BLOCK_SIZE + 6);

    // Tween changes y position for animation
    var blockMovement = this.game.add.tween(block);
    blockMovement.to({y: targetY}, this.ANIMATION_TIME);
    // Start animation
    blockMovement.start();

  // SOUND POINT DROP BLOCKS

  }, // User swap blocks
  swapBlocks: function(block1, block2){

    // When block swapped set scale back to 1 
    block1.scale.setTo(1);

    var block1Movement = this.game.add.tween(block1);
    block1Movement.to({x: block2.x, y: block2.y}, this.ANIMATION_TIME);
    
    block1Movement.onComplete.add(function(){
      
      this.board.swap(block1, block2);
      
      if(!this.isReversingSwap){

        var chains = this.board.findAllChains();

        if(chains.length > 0){
          this.updateBoard();
        }
        else {
          this.isReversingSwap = true;
          this.swapBlocks(block1, block2);
        }
      }
      else {
        this.isReversingSwap = false;
        this.clearSelection();
      }
    }, this);

    block1Movement.start();

    var block2Movement = this.game.add.tween(block2);
    block2Movement.to({x: block1.x, y: block1.y}, this.ANIMATION_TIME);
    block2Movement.start();
  }, 
  pickBlock: function(block){
    // Swap if UI is not blocked
    if(this.isBoardBlocked){
      return;
    }

    // Keep track of selected block
    if(!this.selectedBlock){

      // Highlight first block (make bigger)
      block.scale.setTo(1.3);

      this.selectedBlock = block;
    }
    else {
      
      // Second block selected is target block
      this.targetBlock = block;

      // Check if two blocks are adjacent
      if(this.board.checkAdjacent(this.selectedBlock, this.targetBlock)){

        // Block UI
        this.isBoardBlocked = true;
      
        // BLOCK SWAP SOUND EFFECT POINT
        this.swapBlocks(this.selectedBlock, this.targetBlock);
      }
      else {
        this.clearSelection();
      }
    }
  },
  clearSelection: function(){
    this.isBoardBlocked = false;
    this.selectedBlock = null;

    // Reset to normal size
    this.blocks.setAll('scale.x', 1);
    this.blocks.setAll('scale.y', 1);

  },
  updateBoard: function() {
    this.board.clearChains();
    this.board.updateGrid();

    //after the dropping has ended
    this.game.time.events.add(this.ANIMATION_TIME, function(){
      //see if there are new chains
      var chains = this.board.findAllChains();

      if(chains.length > 0) {
        this.updateBoard();
      }
      else {
        this.clearSelection();
      }
    }, this);
  }


};
