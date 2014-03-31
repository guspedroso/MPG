///////////////////////////// SOCKET STUFF /////////////////////////////////////

var socket = io.connect('http://' + document.location.host, { port: 12315, transports: ["websocket"]});

socket.on('connect', socketConnect);
socket.on('disconnect', socketDisconnect);
socket.on('new player', newPlayer);
socket.on('move player', movePlayer);
socket.on('remove player', removePlayer);
socket.on('new enemy', newEnemy);


function socketConnect() {
  console.log("Connected to the socket server..." + data);
  //socket.emit('new player', { px: })
};

function socketDisconnect() {
  console.log("Disconnect from the socket server.");
};

function newPlayer(data) {
  console.log("new player joined...");
};

function movePlayer(data) {
  console.log(data);
  console.log("moving player");
};

function removePlayer(data) {
  console.log(data);
  console.log("removing player");
};

function newEnemy(data) {
	console.log(data);
	console.log("Enemy Added");
};

function moveEnemy(data) {

};

function removeEnemy(data) {

};

function drawFriendlyBullet(data) {

};

function drawEnemyBullet(data) {

};


///////////////////////////// SOCKET STUFF ABOVE ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////

window.addEventListener("load",function() {

  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
          .setup({ maximize:true }) 
          .controls().touch()

  //Add in the default keyboard controls
  //along with joypad controls for touch
   Q.input.keyboardControls({
    65: "left",
    68: "right",
    87: "up",
    83: "down",
    74: "action",
  });
  Q.input.joypadControls();

////////////////////////////////////////////////////////////////////////////////
//////////////////////// OVERRIDEN QUINTUS FUNCTIONS ///////////////////////////

Q.component("stepControls", {

  added: function() {
    var p = this.entity.p;

    if(!p.stepDistance) { p.stepDistance = 32; }
    if(!p.stepDelay) { p.stepDelay = 0.2; }

    p.stepWait = 0;
    this.entity.on("step",this,"step");
    this.entity.on("hit", this,"collision");
  },

  collision: function(col) {
    var p = this.entity.p;

    if(p.stepping) {
      p.stepping = false;
      p.x = p.origX;
      p.y = p.origY;
    }

  },

  step: function(dt) {
    var p = this.entity.p,
        moved = false;
    p.stepWait -= dt;

    if(p.stepping) {
      p.x += p.diffX * dt / p.stepDelay;
      p.y += p.diffY * dt / p.stepDelay;
    }

    if(p.stepWait > 0) { return; }
    if(p.stepping) {
      p.x = p.destX;
      p.y = p.destY;
    }
    p.stepping = false;

    p.diffX = 0;
    p.diffY = 0;

    if(Q.inputs['left']) {
      p.diffX = -p.stepDistance;
    } else if(Q.inputs['right']) {
      p.diffX = p.stepDistance;
    }

    if(Q.inputs['up']) {
      p.diffY = -p.stepDistance;
    } else if(Q.inputs['down']) {
      p.diffY = p.stepDistance;
    }

    if(p.diffY || p.diffX ) { 
      p.stepping = true;
      p.origX = p.x;
      p.origY = p.y;
      p.destX = p.x + p.diffX;
      p.destY = p.y + p.diffY;
      p.stepWait = p.stepDelay; 

      // Check direction
      var stepDir;
      if (p.diffY > 0) {
        stepDir = "down";
      } else if (p.diffY < 0) {
        stepDir = "up";
      }

      if (p.diffX > 0) {
        stepDir = "right";
      } else if (p.diffX < 0) {
        stepDir = "left";
      }
      socket.emit('move player', { px: p.x, py: p.y, po: stepDir });
    }
  }
});


////////////////////// OVERRIDDEN QUINTUS FUNCTIONS ABOVE //////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// GAME STUFF ///////////////////////////////////

	// Set the gravity to zero since this is a top down game
	Q.gravityY = 0;
	Q.gravityX = 0;

  Q.SPRITE_NONE = 0;
  Q.SPRITE_PLAYER = 1;
  Q.SPRITE_TILES = 2;
  Q.SPRITE_ENEMY = 4;
  Q.SPRITE_PLAYER_BULLET = 8;
  Q.SPRITE_LIFE = 16;
  Q.SPRITE_ENEMY_BULLET = 32;
  Q.SPRITE_TREES = 64;
  Q.SPRITE_TOP_DOOR = 128;
  Q.SPRITE_BOTTOM_DOOR = 256;
  Q.SPRITE_LEFT_DOOR = 512;
  Q.SPRITE_RIGHT_DOOR = 1024;
  Q.SPRITE_RED = 2048;
  Q.SPRITE_DOOR = 4096;
  Q.SPRITE_SPECIAL_BULLET = 8192;
  Q.SPRITE_SPECIAL = 16384;
  Q.SPRITE_EXPLOSION = 32768;

  var totalEnemiesKilled;
  var topDoor;
  var bottomDoor;
  var leftDoor;
  var rightDoor;
  var level2IsRunning = false;

  Q.Sprite.extend("Level1Trees1", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees1",
        sprite:"level1Trees1",
        type: Q.SPRITE_TREES,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY,
        sensor: true
      });
    }
  });

  Q.Sprite.extend("Level1Trees2", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees2",
        sprite:"level1Trees2",
        type: Q.SPRITE_TREES,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY,
        sensor: true
      });
    }
  });

  Q.Sprite.extend("Level1Trees3", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees3",
        sprite:"level1Trees3",
        type: Q.SPRITE_TREES,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY,
        sensor: true
      });
    }
  });

  Q.Sprite.extend("Level1Trees4", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees4",
        sprite:"level1Trees4",
        type: Q.SPRITE_TREES,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY,
        sensor: true
      });
    }
  });

  Q.Sprite.extend("Level1Trees5", {
    init: function(p) {
      this._super(p,{
        sheet:"level1Trees5",
        sprite:"level1Trees5",
        type: Q.SPRITE_TREES,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY,
        sensor: true
      });
    }
  });

  Q.Sprite.extend("horizontalDoor", {
    init: function(p) {
      this._super(p,{
        sheet:"horizontalDoor",
        sprite:"horizontalDoor",
        type: Q.SPRITE_DOOR,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY,
        sensor: true
      });
    }
  });

  Q.Sprite.extend("verticalDoor", {
    init: function(p) {
      this._super(p,{
        sheet:"verticalDoor",
        sprite:"verticalDoor",
        type: Q.SPRITE_DOOR,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY,
        sensor: true
      });
    }
  });

  //Set up the animations for the player, reading frames from sprites.png
  Q.animations("playerBullet", {
    playerLight: {frames:[0,1,2,3,4,4,4,3,2,1,0], rate: 1/6, loop: true},
  });

  //create the bullet object
  Q.Sprite.extend("PlayerBullet", {
    init: function(p) {
      this._super(p,{
        sheet:"playerBullet",
        sprite:"playerBullet",
        type: Q.SPRITE_PLAYER_BULLET,
        collisionMask: Q.SPRITE_ENEMY | Q.SPRITE_TILES | Q.SPRITE_DOOR
      });
      this.add("2d, animation");
      this.on("hit",this,"collision");
      this.on("step",this,"animate");
    },

    animate: function() {
      this.play("playerLight");
    },
    //destory the bullet if it hits an enemy or player
    collision: function(col) {
      this.destroy();
    }
  });

  Q.animations("explosion", {
    explode: {frames:[0,1,2,3,4,5], rate: 1/4, loop: false},
  });

  Q.Sprite.extend("Explosion", {
    init: function(p) {
      this._super(p,{
        sheet:"explosion",
        sprite:"explosion",
        type: Q.SPRITE_EXPLOSION,
        collisionMask: Q.SPRITE_ENEMY
      });
      this.add("2d, animation");
      this.on("step",this,"animate");
    },

    animate: function() {
      var p = this;
      this.play("explode");
      setTimeout(function(){p.destroy()},800);
      return;
    },
  });

  //Set up the animations for the player, reading frames from sprites.png
  Q.animations("specialBullet", {
    specialLight: {frames:[0,1,2,3,4,4,4,3,2,1,0], rate: 1/6, loop: true},
  });

  //create the bullet object
  Q.Sprite.extend("SpecialBullet", {
    init: function(p) {
      this._super(p,{
        sheet:"specialBullet",
        sprite:"specialBullet",
        type: Q.SPRITE_SPECIAL_BULLET,
        collisionMask: Q.SPRITE_ENEMY | Q.SPRITE_TILES | Q.SPRITE_DOOR
      });
      this.add("2d, animation");
      this.on("hit",this,"collision");
      this.on("step",this,"animate");
    },

    animate: function() {
      this.play("specialLight");
    },
    // destroy the bullet if it hits an enemy or player
    collision: function(col) {
      //this.play("explode");
      this.stage.insert(new Q.Explosion({ x: this.p.x, y: this.p.y }));
      this.destroy();
    }
  });

  // create the bullet object
  Q.Sprite.extend("EnemyBullet", {
    init: function(p) {
      this._super(p,{
        sheet:"enemyBullet",
        sprite:"enemyBullet",
        type: Q.SPRITE_ENEMY_BULLET,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_TILES | Q.SPRITE_DOOR
      });
      this.add("2d");
      this.on("hit",this,"collision");
    },

    // destory the bullet if it hits an enemy or player
    collision: function(col) {
      this.destroy();
    } 
  });

  // create the life object
  Q.Sprite.extend("Life", {
    init: function(p) {
      this._super(p,{
        sheet:"life",
        sprite:"life",
        type: Q.SPRITE_LIFE,
        collisionMask: Q.SPRITE_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if (objP.type == Q.SPRITE_PLAYER) {
        this.destroy();
      }
    }
  });

  //create the life object
  Q.Sprite.extend("Special", {
    init: function(p) {
      this._super(p,{
        sheet:"special",
        sprite:"special",
        type: Q.SPRITE_SPECIAL,
        collisionMask: Q.SPRITE_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if (objP.type == Q.SPRITE_PLAYER) {
        this.destroy();
      }
    }
  });

  //create the enemy object
  Q.Sprite.extend("Enemy", {
    init: function(p) {
      this._super(p,{
        sheet:"player",
        sprite:"player",
        life: 5, //change the life to something reasonable once we get things going
        bulletSpeed: 600,
        speed: 200,
        direction: 'left',
        switchPercent: 2,
        type: Q.SPRITE_ENEMY,
        canFire: true,
        bulletInserted: false,
        collisionMask: Q.SPRITE_PLAYER_BULLET | Q.SPRITE_TILES | Q.SPRITE_PLAYER | Q.SPRITE_ENEMY | Q.SPRITE_TREES | Q.SPRITE_DOOR | Q.SPRITE_SPECIAL_BULLET | Q.SPRITE_EXPLOSION
      });
      this.add("2d, BasicAI, animation");
      this.on("hit.sprite",this,"hit");
      this.on("step",this,"step");
      this.on('hit',this,"changeDirection");
      this.on("step",this,"tryToFire");
      this.on("step",this,"animate")
			
			
    },

    animate: function() {
      var p = this.p;
      if (p.direction == "right") {
        if (!p.canFire) {
          this.play("fire_right_running");
        }
        else {
          this.play("run_right")
        }
        
      }
      else if (p.direction == "left") {
        if (!p.canFire) {
          this.play("fire_left_running");
        }
        else {
          this.play("run_left")
        }
      }
      else if (p.direction == "up") {
        if (!p.canFire) {
          this.play("fire_back_running");
        }
        else {
          this.play("run_back")
        }
      }
      else if (p.direction == "down" && !p.canFire) {
        if (!p.canFire) {
          this.play("fire_front_running");
        }
        else {
          this.play("run_front")
        }
      }
    },

    hit: function(col) {
      var life;
      if(col.obj.isA("PlayerBullet")) 
      {
        this.p.life--;
        if (this.p.life == 0) 
        {
          totalEnemiesKilled++;
          life = this.stage.insert(new Q.Special({ x: this.p.x, y: this.p.y }));
          setTimeout(function(){life.destroy()},10000);
          this.destroy();
        }
      }
      else if(col.obj.isA("SpecialBullet") || col.obj.isA("Explosion"))
      {
        life = this.stage.insert(new Q.Special({ x: this.p.x, y: this.p.y }));
          setTimeout(function(){life.destroy()},10000);
          this.destroy();
      }
    },

    fire: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.canFire)
        return;
      p.canFire = false;
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
      p.bulletInserted = true;
      //Insert the bullet into the stage
      this.stage.insert(
        new Q.EnemyBullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );
      setTimeout(function() { p.bulletInserted = false}, 60);
      setTimeout(function() { p.canFire = true}, 200);
    },

    step: function(dt) {
      var p = this.p;

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
      var p = this.p; 
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
      var p = this.p;
      if(p.vx == 0 && p.vy == 0) {
        if(collision.normalY) {
          p.direction = Math.random() < 0.5 ? 'left' : 'right';
        } else if(collision.normalX) {
          p.direction = Math.random() < 0.5 ? 'up' : 'down';
        }
      }
    },

    tryToFire: function() {
      var p = this.p;
      var player = Q("Player").first();
     
      if(!player)
        return;
      if (player.p.x + player.p.w > p.x && player.p.x - player.p.w < p.x) {
        //this.fire();
      }
      
    },
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
        type: Q.SPRITE_PLAYER,
        stepDelay: 0.1,
        life: 10,
        bulletSpeed: 1000,
        special: false,
        bulletInserted: false,
        specialBulletInserted: false,
        specialCanFire: false,
        canFire: true,
        beenHit: false,
        enemiesKilled: 0,
        specialBullets: 0,
        collisionMask: Q.SPRITE_TILES | Q.SPRITE_ENEMY | Q.SPRITE_ENEMY_BULLET | Q.SPRITE_LIFE | Q.SPRITE_TREES | Q.SPRITE_DOOR | Q.SPRITE_SPECIAL,
      });

      this.add("2d, stepControls, animation");
      Q.input.on("fire",this,"fire");
      Q.input.on("action",this,"action");
      this.on("hit.sprite",this,"hit");

      
    },
    
    hit: function(col) {
      var red;
      var p = this.p;
      if (col.obj.isA("Life")) {
        p.life++;
        Q.stageScene('hud', 3, p);
      }
      else if(col.obj.isA("Special")) {
        //If the player picks up a special, change internal special variable to
        //true, that way when the player hits the action button the special 
        //will work. change it back to false after 10 sec so it doesnt work anymore
        p.special = true;
        p.specialCanFire = true;
        p.specialBullets = 5;
        Q.stageScene('hud', 3, p);
       // socket.emit('updatePlayer', { pa: '1'});
        setTimeout(function(){
          p.special = false,
          p.specialCanFire = false,
          p.specialBullets = 0,
          Q.stageScene('hud', 3, p)
        //  socket.emit('updatePlayer', { pa: '0'});
        },10000);
        
      }
      else if((col.obj.isA("Enemy") || col.obj.isA("EnemyBullet")) && !p.beenHit) {
        p.beenHit = true;
        p.life--;
        red = this.stage.insert(new Q.TileLayer({ dataAsset: 'redScreen.json', sheet: 'tiles', type: Q.SPRITE_RED }));
        setTimeout(function(){red.destroy()},200);
        setTimeout(function(){p.beenHit = false}, 200);
        Q.stageScene('hud', 3, p);
      }

      if (p.life == 0) {
        this.destroy();
        //alert("Your suit has been compromised, you have been beamed. You can return in 10 seconds");
      }
			socket.emit('player hit', { pHP: p.life, pSP: p.specialCanFire, pSPAmmo: p.specialBullets});
    },

    action: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.specialCanFire)
        return;
      p.specialCanFire = false;
      //check to see if he has the special and if he still has bullets
      if (p.special && p.specialBullets) {
        //send a bullet
        
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
        p.specialBulletInserted = true;
        //Insert the bullet into the stage
        this.stage.insert(
          new Q.SpecialBullet({ x: x, 
                         y: y,
                         vx: dx * p.bulletSpeed,
                         vy: dy * p.bulletSpeed
                  })
        );
        setTimeout(function() { p.specialBulletInserted = false}, 80);
        setTimeout(function() { p.specialCanFire = true}, 200);
        //decrement amount of available bullets
        p.specialBullets--;
        Q.stageScene('hud', 3, p);
      }
			socket.emit('special', { po: p.direction, pAmmo: p.specialBullets, pA: p.specialCanFire });
    },

    fire: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.canFire)
        return;
      p.canFire = false;
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
      p.bulletInserted = true;
      //Insert the bullet into the stage
      this.stage.insert(
        new Q.PlayerBullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );
      socket.emit('fire bullet', { px: p.x, py: p.y, po: p.direction });
      setTimeout(function() { p.bulletInserted = false}, 80);
      setTimeout(function() { p.canFire = true}, 200);
    },
    
    //step function for controlling how this sprite will move
    step: function(dt) {
      //Grab the input and determine which animation to play
      if(Q.inputs["right"]) {
        //set the direction of the player depending on the input
        this.p.direction = "right";

        //play the fire animation if input reads that the player is firing,
        //else just play the running animation
        if ((Q.inputs["fire"] && this.p.bulletInserted) || this.p.specialBulletInserted) {
          this.play("fire_right_running");
        }
        else {
          this.play("run_right");
        }
      } else if(Q.inputs["left"]) {
        this.p.direction = "left";
        if ((Q.inputs["fire"] && this.p.bulletInserted) || this.p.specialBulletInserted) {
          this.play("fire_left_running")
        }
        else {
          this.play("run_left");
        }
      }
      else if(Q.inputs["up"]) {
        this.p.direction = "up";
        if ((Q.inputs['fire'] && this.p.bulletInserted) || this.p.specialBulletInserted) {
          this.play("fire_back_running")
        }
        else {
          this.play("run_back");
        }
      } else if(Q.inputs["down"]) {
        this.p.direction = "down";
        if ((Q.inputs["fire"] && this.p.bulletInserted) || this.p.specialBulletInserted) {
          this.play("fire_front_running")
        }
        else {
          this.play("run_front");
        }
      }
      else {
        if ((Q.inputs["fire"] && this.p.bulletInserted ) || this.p.specialBulletInserted) {
          if (this.p.direction == "right" && (this.p.bulletInserted || this.p.specialBulletInserted)) {
            this.play("fire_standing_right"); 
          } else if (this.p.direction == "left" && (this.p.bulletInserted || this.p.specialBulletInserted)) {
            this.play("fire_standing_left");
          } else if (this.p.direction == "up" && (this.p.bulletInserted || this.p.specialBulletInserted)) {
            this.play("fire_standing_back");
          } else if (this.p.direction == "down" && (this.p.bulletInserted || this.p.specialBulletInserted)) {
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
  
  //HUD
  Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({x: 60, y: 0}));

  var special = container.insert(new Q.UI.Text({x:240, y: 20,
    label: "Special: " + stage.options.special, color: "white" }));

  var health = container.insert(new Q.UI.Text({x:60, y: 20,
    label: "Health: " + stage.options.life, color: "green" }));

  var specialBullets = container.insert(new Q.UI.Text({x:470, y: 20,
    label: "Special Bullets: " + stage.options.specialBullets, color: "white" }));

  var controls = container.insert(new Q.UI.Text({x:1000, y: 20,
    label: "Move: WASD, Shoot: SPACEBAR, Special: 'J'", color: "white" }));
  container.fit(20);
});

  //Main game screen
  Q.scene("mainMenu",function(stage) {
    //Set up the main screen and buttons
  });

  //First level
  Q.scene("level1",function(stage) {
    totalEnemiesKilled = 0;
    //stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1Collision.json', sheet: 'tiles', type: Q.SPRITE_TILES }));
    stage.insert(new Q.TileLayer({ dataAsset: 'level1Background.json', sheet: 'tiles', type: Q.SPRITE_NONE }));

    var player = stage.insert(new Q.Player({ x: 700, y: 700 }));
    var enemy = stage.insert(new Q.Enemy({ x: 1000, y: 1000 }));
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
      if(Q("Enemy").length == 0 && !Q.stage(1)) 
      { 
        Q.stageScene("endGame",1, { label: "You Win!" }); 
      } 
      else if(Q("Player").length == 0 && !Q.stage(1)) 
      { 
        Q.stageScene("endGame",1, { label: "You Lose!" }); 
      }
    });
    
  });

  //Second level
  Q.scene("level2",function(stage) {
    totalEnemiesKilled = 0;
    level2IsRunning = true;
    stage.insert(new Q.TileLayer({ dataAsset: 'level2Background.json', sheet: 'tiles', type: Q.SPRITE_NONE }));
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level2Collision.json', sheet: 'tiles', type: Q.SPRITE_TILES }));
    /*
    topDoor = stage.insert(new Q.horizontalDoor({ x: 1300, y: 800 }));
    bottomDoor = stage.insert(new Q.horizontalDoor({ x: 1300, y: 1800 }));
    leftDoor = stage.insert(new Q.verticalDoor({ x: 900, y: 1200 }));
    rightDoor = stage.insert(new Q.verticalDoor({ x: 2000, y: 1200 }));
    */
    var player = stage.insert(new Q.Player({ x: 1300, y: 1200 }));
    
    stage.insert(new Q.Enemy({ x: 1800, y: 1200 }));
	//	socket.emit('new Enemy', { pid: '1', px: 1800, py: 1200});
    stage.insert(new Q.Enemy({ x: 1350, y: 1800 }));
	//	socket.emit('new Enemy', { pid: '2', px: 1350, py: 1800});
    stage.insert(new Q.Enemy({ x: 1350, y: 3000 }));
	//	socket.emit('new Enemy', { pid: '3', px: 1350, py: 3000});
    stage.insert(new Q.Enemy({ x: 500, y: 2000 }));
	//	socket.emit('new Enemy', { pid: '4', px: 500, py: 2000});
    stage.insert(new Q.Enemy({ x: 600, y: 2000 }));
	//	socket.emit('new Enemy', { pid: '5', px: 600, py: 2000});
    stage.insert(new Q.Enemy({ x: 700, y: 2000 }));
	//	socket.emit('new Enemy', { pid: '6', px: 700, py: 2000});
    stage.insert(new Q.Enemy({ x: 1900, y: 100 }));
	//	socket.emit('new Enemy', { pid: '7', px: 1900, py: 100});
    stage.insert(new Q.Enemy({ x: 200, y: 200 }));
	//	socket.emit('new Enemy', { pid: '8', px: 200, py: 200});
    stage.insert(new Q.Enemy({ x: 300, y: 300 }));
	//	socket.emit('new Enemy', { pid: '9', px: 300, py: 300});
    
    //Set viewport to follow player
    stage.add("viewport").follow(player);

    //When the enemies have been defeated display label
    stage.on("step",function() {
          if(Q("Enemy").length == 0 && !Q.stage(1)) { 
            level2IsRunning = false;
            Q.stageScene("endGame",1, { label: "You Win!" }); 
          } else if(Q("Player").length == 0 && !Q.stage(1)) { 
            level2IsRunning = false;
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
                                                   label: "Main Menu (Does Nothing)" }))        
    var label = container.insert(new Q.UI.Text({x:8, y: - 10 - restartButton.p.h, 
                                 label: stage.options.label }));
    
    // When the buttons are clicked, clear all the stages
    // and restart the level or go to main menu.
    restartButton.on("click",function() {
      Q.clearStages();
      Q.stageScene('level2');
      Q.stageScene('hud', 3, Q('Player').first().p);
    });
    mainMenuButton.on("click",function() {
      Q.clearStages();
      Q.stageScene('mainMenu');
    });

    //Expand the container to visibily fit it's contents
    container.fit(20);
  });

  ///Load and start the level
  Q.load("sprites.png, sprites.json, level1Collision.json, level1Background.json, tiles.png, redScreen.json, level2Collision.json, level2Background.json", function() {
    Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 }); 
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("level2");
    Q.stageScene('hud', 3, Q('Player').first().p);
  });

});