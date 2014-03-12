window.addEventListener("load",function() {

  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
          .setup({width:   800, // Set the default width to 800 pixels
                  height:  600, // Set the default height to 600 pixels
                  upsampleWidth:  420,  // Double the pixel density of the 
                  upsampleHeight: 320,  // game if the w or h is 420x320
                                        // or smaller (useful for retina phones)
                  downsampleWidth: 1024, // Halve the pixel density if resolution
                  downsampleHeight: 768})  // is larger than or equal to 1024x768)
          .controls()

  //Add in the default keyboard controls
  //along with joypad controls for touch
  Q.input.keyboardControls();
  Q.input.joypadControls();

	// Set the gravity to zero since this is a top down game
	Q.gravityY = 0;
	Q.gravityX = 0;

  var SPRITE_PLAYER = 1;
  var SPRITE_TILES = 2;
  var SPRITE_ENEMY = 4;
  var SPRITE_BULLET = 8;

  //Set up the animations for the player, reading frames from sprites.png
  Q.animations("player", {
    fire_right_running: {frames:[10,11,9,11,10], rate: 1/15},
    fire_left_running: {frames:[23,22,21,22,23], rate: 1/15},
    fire_front_running: {frames:[4,5], rate: 1/4},
    fire_back_running: {frames:[16,17], rate: 1/4},
    fire_standing_right: {frames:[9], rate: 1/4},
    fire_standing_left: {frames:[21], rate: 1/4},
    fire_standing_front: {frames:[3], rate: 1/4},
    fire_standing_back: {frames:[15], rate: 1/4},
    run_right: {frames:[7,6,8,6,7], rate: 1/15},
    run_left: {frames:[18,19,20,19,18], rate: 1/15},
    run_front: {frames:[0,1], rate: 1/5},
    run_back: {frames:[12,13], rate: 1/5},
    stand_right: {frames:[8], rate: 1/5},
    stand_left: {frames:[20], rate: 1/5},
    stand_front: {frames:[2], rate: 1/5},
    stand_back: {frames:[14], rate: 1/5},
    die:{frames:[24], rate: 1/5}
  });

  //create the bullet object
  Q.Sprite.extend("Bullet", {
    init: function(p) {
      this._super(p,{
        sheet:"bullet",
        sprite:"bullet",
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    collision: function(col) {
      var objP = col.obj.p;
      if (objP.type == SPRITE_ENEMY) {
        col.obj.destroy();
        this.destroy();
      };
    }
  });

  //create the enemy object
  Q.Sprite.extend("Enemy", {
    init: function(p) {
      this._super(p,{
        sheet:"enemy",
        sprite:"enemy",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_BULLET | SPRITE_TILES | SPRITE_PLAYER
      });
      this.add("2d, animation");
    }

  });

  //Create the player object
  Q.Sprite.extend("Player", {
    init: function(p) {

      this._super(p,{
        sheet:"player",
        sprite:"player",
        type: SPRITE_PLAYER,
        stepDelay: 0.1,
        points: [ [0, -20 ], [ 30, 20 ], [ -30, 20 ]],
        bulletSpeed: 700,
        collisionMask: SPRITE_TILES | SPRITE_ENEMY
      });

      this.add("2d, stepControls, animation");

      Q.input.on("fire",this,"fire");
    },
    
    fire: function() {
      var p = this.p;
      var angle, x, y;

      //See what direction the player is in and set the bullet to go that way
      if (p.direction == "left") {
        angle = -90;
        x = this.p.x - 35;
        y = this.p.y + 2;
      } else if (p.direction == "right") {
        angle = 90;
        x = this.p.x + 38;
        y = this.p.y + 2;
      } else if (p.direction == "up") {
        angle = 0;
        x = this.p.x - 8;
        y = this.p.y - 45;
      } else if (p.direction == "down") {
        angle = 180;
        x = this.p.x + 10;
        y = this.p.y + 40;
      }
      var dx =  Math.sin(angle * Math.PI / 180),
          dy = -Math.cos(angle * Math.PI / 180);

      //Insert the bullet into the stage
      this.stage.insert(
        new Q.Bullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );
    },
    
    //step function for controlling how this sprite will move
    step: function(dt) {
      //Grab the input and determine which animation to play
      if(Q.inputs["right"]) {
        //set the direction of the player depending on the input
        this.p.direction = "right";

        //play the fire animation if input reads that the player is firing,
        //else just play the running animation
        if (Q.inputs["fire"]) {
          this.play("fire_right_running");
        }
        else {
          this.play("run_right");
        }
      } else if(Q.inputs["left"]) {
        this.p.direction = "left";
        if (Q.inputs["fire"]) {
          this.play("fire_left_running")
        }
        else {
          this.play("run_left");
        }
      }
      else if(Q.inputs["up"]) {
        this.p.direction = "up";
        if (Q.inputs['fire']) {
          this.play("fire_back_running")
        }
        else {
          this.play("run_back");
        }
      } else if(Q.inputs["down"]) {
        this.p.direction = "down";
        if (Q.inputs["fire"]) {
          this.play("fire_front_running")
        }
        else {
          this.play("run_front");
        }
      }
      else {
        if (Q.inputs["fire"]) {
          if (this.p.direction == "right") {
            this.play("fire_standing_right"); 
          } else if (this.p.direction == "left") {
            this.play("fire_standing_left");
          } else if (this.p.direction == "up") {
            this.play("fire_standing_back");
          } else if (this.p.direction == "down") {
            this.play("fire_standing_front");
          }
          
        }
        else {
          if (this.p.direction == "right") {
            this.play("stand_right"); 
          } else if (this.p.direction == "left") {
            this.play("stand_left");
          } else if (this.p.direction == "up") {
            this.play("stand_back");
          } else if (this.p.direction == "down") {
            this.play("stand_front");
          }
        }
      }
    },
  });

  //Main game screen
  Q.scene("mainMenu",function(stage) {
    //Set up the main screen and buttons
  });

  //First level
  Q.scene("level1",function(stage) {

    //Change this to be the backround and not repeater *************
    stage.insert(new Q.Repeater({ asset: "Background3.png" }));
    var player = stage.insert(new Q.Player({ x: 400, y: 400 }));
    var enemy = stage.insert(new Q.Enemy({ x: 420, y: 420 }));
    stage.add("viewport").follow(player);

  });

  // 6. Load and start the level
  Q.load("sprites.png, sprites.json, level.json, Background3.png", function() {
    //Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 });
  	Q.sheet("background, Background3.png");
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("level1");
  });

});