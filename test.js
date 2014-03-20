window.addEventListener("load",function() {

  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
          .setup({ maximize:true })  // is larger than or equal to 1024x768)
          .controls()

  //Add in the default keyboard controls
  //along with joypad controls for touch
   Q.input.keyboardControls({
    65: "left",
    68: "right",
    87: "up",
    83: "down"
  });
  Q.input.joypadControls();

	// Set the gravity to zero since this is a top down game
	Q.gravityY = 0;
	Q.gravityX = 0;

  var SPRITE_NONE = 0;
  var SPRITE_PLAYER = 1;
  var SPRITE_TILES = 2;
  var SPRITE_ENEMY = 4;
  var SPRITE_PLAYER_BULLET = 8;
  var SPRITE_LIFE = 16;
  var SPRITE_ENEMY_BULLET = 32;
  var SPRITE_TREES = 64;

    //create the bullet object
  Q.Sprite.extend("Level1Trees1", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees1",
        sprite:"level1Trees1",
        type: SPRITE_TREES
      });
      this.add("2d");
    }
  });

  Q.Sprite.extend("Level1Trees2", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees2",
        sprite:"level1Trees2",
        type: SPRITE_TREES
      });
      this.add("2d");
    }
  });

  Q.Sprite.extend("Level1Trees3", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees3",
        sprite:"level1Trees3",
        type: SPRITE_TREES
      });
      this.add("2d");
    }
  });

  Q.Sprite.extend("Level1Trees4", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees4",
        sprite:"level1Trees4",
        type: SPRITE_TREES
      });
      this.add("2d");
    }
  });

  Q.Sprite.extend("Level1Trees5", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees5",
        sprite:"level1Trees5",
        type: SPRITE_TREES
      });
      this.add("2d");
    }
  });

  //create the bullet object
  Q.Sprite.extend("PlayerBullet", {
    init: function(p) {
      this._super(p,{
        sheet:"playerBullet",
        sprite:"playerBullet",
        type: SPRITE_PLAYER_BULLET,
        collisionMask: SPRITE_ENEMY
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //destory the bullet if it hits an enemy or player
    collision: function(col) {
      var objP = col.obj.p;
      if (objP.type == SPRITE_ENEMY) {
        this.destroy();
      };
    }
  });

  //create the bullet object
  Q.Sprite.extend("EnemyBullet", {
    init: function(p) {
      this._super(p,{
        sheet:"enemyBullet",
        sprite:"enemyBullet",
        type: SPRITE_ENEMY_BULLET,
        collisionMask: SPRITE_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //destory the bullet if it hits an enemy or player
    collision: function(col) {
      var objP = col.obj.p;
      if (objP.type == SPRITE_PLAYER) {
        this.destroy();
      };
    }
  });

  //create the life object
  Q.Sprite.extend("Life", {
    init: function(p) {
      this._super(p,{
        sheet:"life",
        sprite:"life",
        type: SPRITE_LIFE,
        collisionMask: SPRITE_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if (objP.type == SPRITE_PLAYER) {
        this.destroy();
      };
    }
  });

  //A.I. controls for the enemy
  Q.component("enemyControls", {
    defaults: { speed: 200, direction: 'left', switchPercent: 2 },

    added: function() {
      var p = this.entity.p;

      Q._defaults(p,this.defaults);

      this.entity.on("step",this,"step");
      this.entity.on('hit',this,"changeDirection");
    },

    step: function(dt) {
      var p = this.entity.p;

      // Randomly try to switch directions
      if(Math.random() < p.switchPercent / 100) {
        this.tryDirection();
      }

      // Add velocity in the direction we are currently heading.
      switch(p.direction) {
        case "left": p.vx = -p.speed; break;
        case "right":p.vx = p.speed; break;
        case "up":   p.vy = -p.speed; break;
        case "down": p.vy = p.speed; break;
      }
    },

    // Try a random direction 90 degrees away from the 
    // current direction of movement
    tryDirection: function() {
      var p = this.entity.p; 
      var from = p.direction;
      if(p.vy != 0 && p.vx == 0) {
        p.direction = Math.random() < 0.5 ? 'left' : 'right';
      } else if(p.vx != 0 && p.vy == 0) {
        p.direction = Math.random() < 0.5 ? 'up' : 'down';
      }
    },

    // Called every collision, if we're stuck,
    // try moving in a direction 90 away from the normal
    changeDirection: function(collision) {
      var p = this.entity.p;
      if(p.vx == 0 && p.vy == 0) {
        if(collision.normalY) {
          p.direction = Math.random() < 0.5 ? 'left' : 'right';
        } else if(collision.normalX) {
          p.direction = Math.random() < 0.5 ? 'up' : 'down';
        }
      }
    }
  });

  //create the enemy object
  Q.Sprite.extend("Enemy", {
    init: function(p) {
      this._super(p,{
        sheet:"enemy",
        sprite:"enemy",
        life: 4, //change the life to something reasonable once we get things going
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_PLAYER_BULLET | SPRITE_TILES | SPRITE_PLAYER | SPRITE_ENEMY
      });
      this.add("2d, enemyControls, animation");
      this.on("hit.sprite",this,"hit");
    },

    hit: function(col) {
      //enemy drops a life when dies. If certain amount of enemies are killed
      //then the enemy drops a key to the door to the next part of the map
      var life, key;
      if(col.obj.isA("PlayerBullet")) {
        this.p.life--;
        if (this.p.life == 0) {
          life = this.stage.insert(new Q.Life({ x: this.p.x, y: this.p.y }));
          setTimeout(function(){life.destroy()},10000);
          this.destroy();
        }
      }
    }
  });

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

  //Create the player object
  Q.Sprite.extend("Player", {
    init: function(p) {

      this._super(p,{
        sheet:"player",
        sprite:"player",
        type: SPRITE_PLAYER,
        stepDelay: 0.1,
        life: 100,
        bulletSpeed: 700,
        special: false,
        collisionMask: SPRITE_TILES | SPRITE_ENEMY | SPRITE_LIFE | SPRITE_ENEMY_BULLET
      });

      this.add("2d, stepControls, animation");

      Q.input.on("fire",this,"fire");
      Q.input.on("action",this,"action");
      this.on("hit.sprite",this,"hit");
    },
    
    hit: function(col) {
      var red;
      if(col.obj.isA("Life")) {
        this.p.life++;
      }
      else if(col.obj.isA("Enemy")) {
        this.p.life--;
        red = this.stage.insert(new Q.TileLayer({ dataAsset: 'redScreen.json', sheet: 'tiles', type: SPRITE_NONE }));
        setTimeout(function(){red.destroy()},250);
      }
      else if(col.obj.isA("Special")) {
        //If the player picks up a special, change internal special variable to
        //true, that way when the player hits the action button the special 
        //will work. change it back to false after 10 sec so it doesnt work anymore
        this.p.special = true;
        setTimeout(function(){this.p.special = false},10000);
      }

      if (this.p.life == 0) {
        this.destroy();
        //alert("Your suit has been compromised, you have been beamed. You can return in 10 seconds");
      };
    },

    action: function() {
      if (this.p.special) {
        //do the special
      };
    },

    fire: function() {
      var p = this.p;
      var angle, x, y;

      //See what direction the player is in and set the bullet to go that way
      if (p.direction == "left") {
        angle = -90;
        x = this.p.x - 47;
        y = this.p.y + 2;
      } else if (p.direction == "right") {
        angle = 90;
        x = this.p.x + 47;
        y = this.p.y + 2;
      } else if (p.direction == "up") {
        angle = 0;
        x = this.p.x - 8;
        y = this.p.y - 60;
      } else if (p.direction == "down") {
        angle = 180;
        x = this.p.x + 10;
        y = this.p.y + 60;
      }
      var dx =  Math.sin(angle * Math.PI / 180),
          dy = -Math.cos(angle * Math.PI / 180);

      //Insert the bullet into the stage
      this.stage.insert(
        new Q.PlayerBullet({ x: x, 
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
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1Collision.json', sheet: 'tiles', type: SPRITE_TILES }));
    stage.insert(new Q.TileLayer({ dataAsset: 'level1Background.json', sheet: 'tiles', type: SPRITE_NONE }));

    var player = stage.insert(new Q.Player({ x: 700, y: 700 }));
    var enemy = stage.insert(new Q.Enemy({ x: 800, y: 800 }));
    var trees1 = stage.insert(new Q.Level1Trees1({ x: 485, y: 100 }));
    var trees2 = stage.insert(new Q.Level1Trees2({ x: 300, y: 291 }));
    var trees3 = stage.insert(new Q.Level1Trees3({ x: 90, y: 431 }));
    var trees4 = stage.insert(new Q.Level1Trees4({ x: 145, y: 554 }));
    var trees5 = stage.insert(new Q.Level1Trees5({ x: 117, y: 815 }));

    //Set viewport to follow player
    stage.add("viewport").follow(player);
   

    //We can change this to call different scenes when we create more
    //Instead of just calling the endgame scene
    
    //When the enemies have been defeated display label
    stage.on("step",function() {
          if(Q("Enemy").length == 0 && !Q.stage(1)) { 
            Q.stageScene("endGame",1, { label: "You Win!" }); 
          } else if(Q("Player").length == 0 && !Q.stage(1)) { 
            Q.stageScene("endGame",1, { label: "You Lose!" }); 
          }
        });
    
  });

  //Scene that occurs after game ends
  Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.5)"
    }));

    var restartButton = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                   label: "Restart Level" })) 
    var mainMenuButton = container.insert(new Q.UI.Button({ x: 0, y: 80, fill: "#CCCCCC",
                                                   label: "Main Menu" }))        
    var label = container.insert(new Q.UI.Text({x:8, y: - 10 - restartButton.p.h, 
                                 label: stage.options.label }));
    
    // When the buttons are clicked, clear all the stages
    // and restart the level or go to main menu.
    restartButton.on("click",function() {
      Q.clearStages();
      Q.stageScene('level1');
    });
    mainMenuButton.on("click",function() {
      Q.clearStages();
      Q.stageScene('mainMenu');
    });

    //Expand the container to visibily fit it's contents
    container.fit(20);
  });

  //Load and start the level
  Q.load("sprites.png, sprites.json, level1Collision.json, level1Background.json, tiles.png, redScreen.json", function() {
    Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 }); 
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("level1");
  });

});