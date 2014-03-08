// 1. Wait for the onload event
window.addEventListener("load",function() {

  // 2. Set up a basic Quintus object
  //    with the necessary modules and controls
  //    to make things easy, we're going to fix this game at 640x480
  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
          .setup({ width: 720, height: 480})
          .controls(true)

  // 3. Add in the default keyboard controls
  //    along with joypad controls for touch
  Q.input.keyboardControls();
  Q.input.joypadControls();

	// Add these two lines below the controls
	Q.gravityY = 0;
	Q.gravityX = 0;

  Q.animations("player", {
    fire_right_running: {frames:[10,11,9,11,10], rate: 1/10},
    fire_left_running: {frames:[23,22,21,22,23], rate: 1/10},
    fire_front_running: {frames:[4,5], rate: 1/10},
    fire_back_running: {frames:[16,17], rate: 1/10},
    fire_standing_right: {frames:[9], rate: 1/5},
    fire_standing_left: {frames:[21], rate: 1/5},
    fire_standing_front: {frames:[3], rate: 1/5},
    fire_standing_back: {frames:[15], rate: 1/5},
    run_right: {frames:[7,6,8,6,7], rate: 1/10},
    run_left: {frames:[18,19,20,19,18], rate: 1/10},
    run_front: {frames:[0,1], rate: 1/10},
    run_back: {frames:[12,13], rate: 1/10},
    stand_right: {frames:[8], rate: 1/5},
    stand_left: {frames:[20], rate: 1/5},
    stand_front: {frames:[2], rate: 1/5},
    stand_back: {frames:[14], rate: 1/5},
    die:{frames:[24], rate: 1/5}
  });

  // 4. Add in a basic sprite to get started
  Q.Sprite.extend("Player", {
    init: function(p) {

      this._super(p,{
        sheet:"player",
        sprite:"player",
        
      });

      this.add("2d, platformerControls, animation");
    },
      step: function(dt) {
        if(this.p.vx > 0) {
          if (Q.inputs['action']) {
            this.play("fire_right_running");
          }
          else {
            this.play("run_right");
          }
        } else if(this.p.vx < 0) {
          if (Q.inputs['action']) {
            this.play("fire_left_running")
          }
          else {
            this.play("run_left");
          }
        }
        else {
          if (Q.inputs['action']) {
            this.play("fire_standing_" + this.p.direction); 
          }
          else {
            this.play("stand_" + this.p.direction); // stand_left or stand_right
          }
        }
    },
  });

  // 5. Put together a minimal level
  Q.scene("level1",function(stage) {

    stage.insert(new Q.Repeater({ asset: "Background3.png" }));
    var player = stage.insert(new Q.Player({ x: 400, y: 400 }));
    stage.add("viewport").follow(player);

  });

  // 6. Load and start the level
  Q.load("sprites.png, sprites.json, level.json, Background3.png", function() {
  	Q.sheet("background, Background3.png");
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("level1");
  });

});