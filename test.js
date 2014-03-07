// 1. Wait for the onload event
window.addEventListener("load",function() {

  // 2. Set up a basic Quintus object
  //    with the necessary modules and controls
  //    to make things easy, we're going to fix this game at 640x480
  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D")
          .setup({  width:   800, // Set the default width to 800 pixels
									  height:  600, // Set the default height to 600 pixels
									  upsampleWidth:  420,  // Double the pixel density of the 
									  upsampleHeight: 320,  // game if the w or h is 420x320
									                        // or smaller (useful for retina phones)
									  downsampleWidth: 1024, // Halve the pixel density if resolution
									  downsampleHeight: 768  // is larger than or equal to 1024x768
	});

  // 3. Add in the default keyboard controls
  //    along with joypad controls for touch
  Q.input.keyboardControls();
  Q.input.joypadControls();

	// Add these two lines below the controls
	Q.gravityY = 0;
	Q.gravityX = 0;

  // 4. Add in a basic sprite to get started
  Q.Sprite.extend("Player", {
    init: function(p) {

      this._super(p,{
        sheet:"playerFaceFrontStanding"
      });

      this.add("2d");
    }
  });

  // 5. Put together a minimal level
  Q.scene("level1",function(stage) {
    var player = stage.insert(new Q.Player({ x: 48, y: 48 }));
    stage.add("viewport").follow(player);

  });

  // 6. Load and start the level
  Q.load("sprites.png, sprites.json, level.json, Background3.png", function() {
  	Q.sheet("Background3.png");
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("level1");
  });

});