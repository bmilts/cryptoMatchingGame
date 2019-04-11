var Match3 = Match3 || {};

//loading the game assets
Match3.PreloadState = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX - 175, this.game.world.centerY - 175, 'bar');
    // this.preloadBar.anchor.setTo(0.5);
    // this.preloadBar.scale.setTo(100, 1);
    this.load.setPreloadSprite(this.preloadBar);

    //load game assets
    this.load.image('block1', 'assets/images/bitcoin.png');
    this.load.image('block2', 'assets/images/zcash.png');
    this.load.image('block3', 'assets/images/litecoin.png');
    this.load.image('block4', 'assets/images/monero.png');
    this.load.image('block5', 'assets/images/ripple.png');
    this.load.image('block6', 'assets/images/ethereum.png');
    this.load.image('block7', 'assets/images/pound.png');
    this.load.image('block8', 'assets/images/dollar.png');
    this.load.image('deadBlock', 'assets/images/coins.png');
    this.load.image('background', 'assets/images/blockchain.png');
    this.load.image('button', 'assets/images/button.svg');
    this.load.image('button', 'assets/images/logo3.png');


    // Load audio file
    this.load.audio('music', ['assets/audio/8bit.mp3', 'assets/audio/8bit.ogg']);


  },
  create: function() {
    this.state.start('Game');
    // this.state.start('MainMenu');
  }
};