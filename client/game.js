
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////

window.addEventListener("load",function() {


  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
          Q.setup({ maximize:true }) 
          .controls(true)
          .touch(Q.SPRITE_ALL);

///////////////////////////// SOCKET STUFF /////////////////////////////////////

var socket;

//Current player
var currentPlayer;
//All the other players
var allPlayers;

init();

// This function initializes the socket connection, sets event handlers
function init(){
	socket = io.connect('http://' + document.location.host, { port: 80, 
    transports: ["websocket"]});
	// Sets default spawn coordinates
	// var xValue = 1300,
				// yValue = 1200;
	// Create player object for client
	// currentPlayer = new Player(xValue, yValue);
	allPlayers = [];
	setEventHandlers();
};

// This function sets the event handlers for all socket messages
function setEventHandlers() {
	socket.on('connect', socketConnect);
	socket.on('disconnect', socketDisconnect);
	socket.on('new player', addNewPlayer);
	socket.on('move player', movePlayer);
	socket.on('remove player', removePlayer);
	socket.on('new enemy', newEnemy);
  socket.on('fire bullet', drawFriendlyBullet);
  socket.on('door open', doorOpen);
};

// This function is executed upon socket connect message
function socketConnect() {
  console.log("Connected to the socket server...");
  
  loadGame();
};

// This function is executed upon socket disconnect message
// Will remove disconnected players (if any)
function socketDisconnect(data) {
  console.log("Disconnect from the socket server.");
  var playerDel = findPlayer(data.pid);
  console.log(playerDel.p.pid);
  playerDel.destroy();
};

/* 
 * addNewPlayer function which will add a new player upon a connect message
 * It will put the player onto the array, and draw him on the stage. 
 */
function addNewPlayer(data) {
  console.log("new player joined...");
	//add new player to client
//	var newPlayer = new Player(data.x, data.y);
	//newPlayer.id = data.id;
	//push player to player list on client
  var newPlayer = new Q.OtherPlayer1({ x: data.x, y: data.y, pid: data.pid });
  console.log("new player " + data.x + " " + data.y);
  // Q(newPlayer).set("pid", data.pid);
  Q.stage().insert(newPlayer);
  // var newPlayer = new Q.OtherPlayer1({ x: data.x, y: data.y, id: data.id });
	allPlayers.push(newPlayer);
  
};

/*
 * movePlayer function which will set the new coordinates of the other players
 * every time a move message is received. 
 */
function movePlayer(data) {
  // console.log(data.pid);
  //console.log("moving player");
	//find moving player
	var playerMove = findPlayer(data.pid);
	//change his coordinates
	// playerMove.setX(data.x);
	// playerMove.setY(data.y);
 // var playerMove2 = Q.stage().locate(data.pxs, data.pys, Q.SPRITE_PLAYER);
  
  playerMove.set({x: data.px, y: data.py});
  console.log(data.px + " " + data.py);
  playerMove.animate(data.po, "false");
  // Q("OtherPlayer1").set({x: data.px, y: data.py});
//  Q("OtherPlayer1").invoke("step", data.po, "false");
};

/* 
 * removePlayer function which removes a player from the screen upon a remove
 * message. This can be either due to death or some other reason. 
 */
function removePlayer(data) {
  var playerDel = findPlayer(data.pid);
  playerDel.destroy();
};

function newEnemy(data) {
	console.log(data);
	console.log("Enemy Added");
};

function moveEnemy(data) {

};

function removeEnemy(data) {

};

/*
 * drawFriendlyBullet function which will draw bullets from other players when 
 * they fire their primary weapon. 
 */ 
function drawFriendlyBullet(data) {
  var playerFire = findPlayer(data.pid);
  playerFire.animate(data.po, "true");
  playerFire.fire(data.po);
};

function drawEnemyBullet(data) {

};

function doorOpen(data) {
  console.log("door open");
  var doorDel = Q.stage().locate(data.doorX, data.doorY ,Q.SPRITE_DOOR);
  doorDel.destroy();
};

/*
 * findPlayer function which finds the player within the local client player 
 * array by the assigned socket ID. 
 */ 
function findPlayer(id) {
  for (var i = 0; i < allPlayers.length; i++) {
    if (allPlayers[i].p.pid == id) {
      return allPlayers[i];
    };
  };
};

///////////////////////////// SOCKET STUFF ABOVE ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//////////////////////////// SOME CRUCIAL FUNCTIONS ////////////////////////////

function loadGame() {
  Q.load("sprites.png, sprites.json, level1Collision.json, level1Background.json, tiles.png, redScreen.json, level2Collision.json, level2Background.json", function() {
    Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 }); 
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("mainMenu",1, { label: "Main Menu" }); 
  });
};

function loadCoOp() {
  Q.clearStages();
  Q.stageScene('level2');
  Q.stageScene('hud', 3, Q('Player').first().p);
  var px = currentPlayer.p.x;
  var py = currentPlayer.p.y;
  //sends new player request to server
  console.log(px + " " + py);
  socket.emit('new player', { x: px, y: py });
};


///////////////////////// SOME CRUCIAL FUNCTIONS ABOVE /////////////////////////
////////////////////////////////////////////////////////////////////////////////
//////////////////////////// CONTROLS AND INPUTS ///////////////////////////////



  //Add in the default keyboard controls
  //along with joypad controls for touch
   Q.input.keyboardControls({
    65: "left",
    68: "right",
    87: "up",
    83: "down",
    74: "fireLeft",
    75: "fireDown",
    76: "fireRight",
    73: "fireUp",
    32: "specialGun",

  });
  Q.input.joypadControls();

////////////////////////// CONTROLS AND INPUTS ABOVE ///////////////////////////
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

        socket.emit('move player', { x: p.destX, y: p.destY, o: stepDir });
      }
    }
  });


////////////////////// OVERRIDDEN QUINTUS FUNCTIONS ABOVE //////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// GAME STUFF ///////////////////////////////////

///////////////////// SPRITE VALUES AND OTHER SETTINGS /////////////////////////

	// Set the gravity to zero since this is a top down game
  Q.gravityY = 0;
  Q.gravityX = 0;

  //Set the types for the entities, for collision. Need to be powers of 2
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
  Q.SPRITE_KEY = 65536;
  Q.SPRITE_OTHER_PLAYER = 131072;

  var totalEnemiesKilled; //Keep track of enemies killed
  var topDoor; //Declare variables for the doors, to remove them later
  var bottomDoor;
  var leftDoor;
  var rightDoor;
  var level2IsRunning = false; //So the functions execute properly
  var moveX = 0; //If we need to move all the entities on the board consistently
  var moveY = 640;
  var totalKeys = 0; //Once the player has gotten all the keys, open the boss door
  
/////////////////// SPRITE VALUES AND OTHER SETTINGS ABOVE /////////////////////
////////////////////////////////////////////////////////////////////////////////
//////////////////////////// ENTITIES AND ACTIONS //////////////////////////////

//////////////////////////// TREES AND ENVIRONMENT /////////////////////////////

    //Tree object 1 for the enviroment
  Q.Sprite.extend("Tree1", {
    init: function(p) {
      this._super(p,{
        sheet:"tree1",
        sprite:"tree1",
        type: Q.SPRITE_TREES,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY | Q.SPRITE_PLAYER_BULLET | Q.SPRITE_SPECIAL_BULLET | Q.SPRITE_ENEMY_BULLET | Q.SPRITE_OTHER_PLAYER
      });
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      this.p.x -= col.separate[0];
      this.p.y -= col.separate[1];
    }
  });

  //Tree object 2 for the enviroment
  Q.Sprite.extend("Tree2", {
    init: function(p) {
      this._super(p,{
        sheet:"tree2",
        sprite:"tree2",
        type: Q.SPRITE_TREES,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY | Q.SPRITE_PLAYER_BULLET | Q.SPRITE_SPECIAL_BULLET | Q.SPRITE_ENEMY_BULLET | Q.SPRITE_OTHER_PLAYER
      });
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      this.p.x -= col.separate[0];
      this.p.y -= col.separate[1];
    }
  });

  //horizontal door object 
  Q.Sprite.extend("horizontalDoor", {
    init: function(p) {
      this._super(p,{
        sheet:"horizontalDoor",
        sprite:"horizontalDoor",
        type: Q.SPRITE_DOOR,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY | Q.SPRITE_OTHER_PLAYER
      });
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      var objP = col.obj.p;
      if (((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) && (objP.keys > 0)) 
      {
        objP.keys--;
        Q.stageScene('hud', 3, objP);
        this.destroy();
        socket.emit('door open', { doorX: this.p.x, doorY: this.p.y });
      }
      else
      {
        this.p.x -= col.separate[0];
        this.p.y -= col.separate[1];
      }
    }
  });

  //vertical door object 
  Q.Sprite.extend("verticalDoor", {
    init: function(p) {
      this._super(p,{
        sheet:"verticalDoor",
        sprite:"verticalDoor",
        type: Q.SPRITE_DOOR,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_ENEMY | Q.SPRITE_OTHER_PLAYER
      });
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      var objP = col.obj.p;
      if (((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) && (objP.keys > 0)) 
      {
        objP.keys--;
        Q.stageScene('hud', 3, objP);
        this.destroy();
        socket.emit('door open', { doorX: this.p.x, doorY: this.p.y });
      }
      else
      {
        this.p.x -= col.separate[0];
        this.p.y -= col.separate[1];
      }
    }
  });

/////////////////////// TREES AND ENVIRONMENT ABOVE ////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/////////////////////////// AMMUNITION AND DROPS ///////////////////////////////
  
  //Animations for the player bullet, reading frames from playerBullet in sprites.png
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
        collisionMask: Q.SPRITE_ENEMY | Q.SPRITE_TILES | Q.SPRITE_DOOR | Q.SPRITE_TREES
      });
      this.add("2d, animation");
      this.on("hit",this,"collision");
      this.on("step",this,"animate");
    },

    //This is a function to animate the bullet as it flies, plays the animation
    animate: function() {
      this.play("playerLight");
    },
    //destroy the bullet if it hits anything
    collision: function(col) {
      this.destroy();
    }
  });

  //Animations for the explosion that happens after the special bullet collides
  Q.animations("explosion", {
    explode: {frames:[0,1,2,3,4,5], rate: 1/4, loop: false},
  });

  //Explosion object that is inserted after the special bullet collides
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

    //This function will animate and then destroy itself after the animation completes
    animate: function() {
      var p = this;
      this.play("explode");
      setTimeout(function(){p.destroy()},800);
      return;
    },
  });

  //Animations for the special bullet, reading frames from specialBullet in sprites.png
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
        collisionMask: Q.SPRITE_ENEMY | Q.SPRITE_TILES | Q.SPRITE_DOOR | Q.SPRITE_TREES
      });
      this.add("2d, animation");
      this.on("hit",this,"collision");
      this.on("step",this,"animate");
    },
    //play the animation for the bullet as it flies
    animate: function() {
      this.play("specialLight");
    },
    //destroy the bullet if it hits anything
    collision: function(col) {
      this.stage.insert(new Q.Explosion({ x: this.p.x, y: this.p.y }));
      this.destroy();
    }
  });

  //create the enemy bullet object
  Q.Sprite.extend("EnemyBullet", {
    init: function(p) {
      this._super(p,{
        sheet:"enemyBullet",
        sprite:"enemyBullet",
        type: Q.SPRITE_ENEMY_BULLET,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_TILES | Q.SPRITE_DOOR | Q.SPRITE_TREES | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d");
      this.on("hit",this,"collision");
    },

    //Destroy the bullet if it hits anything
    collision: function(col) {
      this.p.x -= col.separate[0];
      this.p.y -= col.separate[1];
      this.destroy();
    }
  });

  //create the life object
  Q.Sprite.extend("Life", {
    init: function(p) {
      this._super(p,{
        sheet:"life",
        sprite:"life",
        type: Q.SPRITE_LIFE,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if ((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) {
        this.destroy();
      }
    }
  });

  //create the special gun object
  Q.Sprite.extend("SpecialGun", {
    init: function(p) {
      this._super(p,{
        sheet:"specialGun",
        sprite:"specialGun",
        type: Q.SPRITE_SPECIAL,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the special collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if ((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) {
        this.destroy();
      }
    }
  });

  //create the special speed object
  Q.Sprite.extend("SpecialSpeed", {
    init: function(p) {
      this._super(p,{
        sheet:"specialSpeed",
        sprite:"specialSpeed",
        type: Q.SPRITE_SPECIAL,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if ((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) {
        this.destroy();
      }
    }
  });

  //create the special invincibility object
  Q.Sprite.extend("SpecialInvincibility", {
    init: function(p) {
      this._super(p,{
        sheet:"specialInvincibility",
        sprite:"specialInvincibility",
        type: Q.SPRITE_SPECIAL,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if ((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) {
        this.destroy();
      }
    }
  });

  //create the special invisibility object
  Q.Sprite.extend("SpecialInvisibility", {
    init: function(p) {
      this._super(p,{
        sheet:"specialInvisibility",
        sprite:"specialInvisibility",
        type: Q.SPRITE_SPECIAL,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if ((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) {
        this.destroy();
      }
    }
  });

  //Key object
  Q.Sprite.extend("Key", {
    init: function(p) {
      this._super(p,{
        sheet:"key",
        sprite:"key",
        type: Q.SPRITE_KEY,
        collisionMask: Q.SPRITE_PLAYER | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d");
      this.on("hit.sprite",this,"collision");
    },

    //If the life collides with a player, destroy it, keep it on map otherwise
    collision: function(col) {
      var objP = col.obj.p;
      if ((objP.type == Q.SPRITE_PLAYER) || (objP.type == Q.SPRITE_OTHER_PLAYER)) {
        this.destroy();
      }
    }
  });

///////////////////////// AMMUNITION AND DROPS ABOVE ///////////////////////////

//////////////////////// ENTITIES AND ACTIONS ABOVE ////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// ENEMY ////////////////////////////////////

  //Set up the animations for the enemy, reading frames from enemy in sprites.png
  Q.animations("enemy", {
    enemy_fire_right_running: {frames:[10,11,9,11,10], rate: 1/10},
    enemy_fire_left_running: {frames:[23,22,21,22,23], rate: 1/10},
    enemy_fire_front_running: {frames:[4,5], rate: 1/3},
    enemy_fire_back_running: {frames:[16,17], rate: 1/3},
    enemy_fire_standing_right: {frames:[9], rate: 1/3},
    enemy_fire_standing_left: {frames:[21], rate: 1/3},
    enemy_fire_standing_front: {frames:[3], rate: 1/3},
    enemy_fire_standing_back: {frames:[15], rate: 1/3},
    enemy_run_right: {frames:[7,6,8,6,7], rate: 1/10},
    enemy_run_left: {frames:[18,19,20,19,18], rate: 1/10},
    enemy_run_front: {frames:[0,1], rate: 1/3},
    enemy_run_back: {frames:[12,13], rate: 1/3},
    enemy_stand_right: {frames:[8], rate: 1/3},
    enemy_stand_left: {frames:[20], rate: 1/3},
    enemy_stand_front: {frames:[2], rate: 1/3},
    enemy_stand_back: {frames:[14], rate: 1/3},
    enemy_die:{frames:[24], rate: 1/5}
  });

  //create the enemy object
  Q.Sprite.extend("Enemy", {
    init: function(p) {
      this._super(p,{
        sheet:"enemy",
        sprite:"enemy",
        life: 5, //change the life to something reasonable once we get things going
        bulletSpeed: 300,
        speed: 100,
        direction: 'left',
        switchPercent: 2,
        type: Q.SPRITE_ENEMY,
        canFire: true,
        bulletInserted: false,
        collisionMask: Q.SPRITE_PLAYER_BULLET | Q.SPRITE_TILES | Q.SPRITE_PLAYER | Q.SPRITE_ENEMY | Q.SPRITE_TREES | Q.SPRITE_DOOR | Q.SPRITE_SPECIAL_BULLET | Q.SPRITE_EXPLOSION | Q.SPRITE_OTHER_PLAYER
      });
      this.add("2d, animation");
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
          this.play("enemy_fire_right_running");
        }
        else {
          this.play("enemy_run_right")
        }
        
      }
      else if (p.direction == "left") {
        if (!p.canFire) {
          this.play("enemy_fire_left_running");
        }
        else {
          this.play("enemy_run_left")
        }
      }
      else if (p.direction == "up") {
        if (!p.canFire) {
          this.play("enemy_fire_back_running");
        }
        else {
          this.play("enemy_run_back")
        }
      }
      else if (p.direction == "down" && !p.canFire) {
        if (!p.canFire) {
          this.play("enemy_fire_front_running");
        }
        else {
          this.play("enemy_run_front")
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
          if (totalEnemiesKilled == 1 || totalEnemiesKilled == 4 || totalEnemiesKilled == 7 || totalEnemiesKilled == 10) {
            this.stage.insert(new Q.Key({ x: 1300, y: 1200 + moveY}));
          }
          //this.stage.insert(new Q.SpecialInvisibility({ x: this.p.x, y: this.p.y }));
          
          //generate a random value to determine whether to drop a life or special
          var lifeOrSpecial = Math.floor((Math.random()*2)+1);

          if (lifeOrSpecial == 1) 
          {
            life = this.stage.insert(new Q.Life({ x: this.p.x, y: this.p.y }));
            setTimeout(function(){life.destroy()},10000);
          }
          else if (lifeOrSpecial == 2)
          {
            var oneOfTheSpecials = Math.floor((Math.random()*4)+1);
            switch(oneOfTheSpecials)
            {
              case 1: this.stage.insert(new Q.SpecialGun({ x: this.p.x, y: this.p.y }));
                break;
              case 2: this.stage.insert(new Q.SpecialSpeed({ x: this.p.x, y: this.p.y }));
                break;
              case 3: this.stage.insert(new Q.SpecialInvincibility({ x: this.p.x, y: this.p.y }));
                break;
              case 4: this.stage.insert(new Q.SpecialInvisibility({ x: this.p.x, y: this.p.y }));
                break;
            }
          }
        
          this.destroy();
        }
      }
      else if(col.obj.isA("SpecialBullet") || col.obj.isA("Explosion"))
      {
        totalEnemiesKilled++;
        if (totalEnemiesKilled == 1 || totalEnemiesKilled == 4 || totalEnemiesKilled == 7 || totalEnemiesKilled == 10) {
          this.stage.insert(new Q.Key({ x: 1300, y: 1200 + moveY}));
        }

        //generate a random value to determine whether to drop a life or special
        var lifeOrSpecial = Math.floor((Math.random()*2)+1);

        if (lifeOrSpecial == 1) 
        {
          life = this.stage.insert(new Q.Life({ x: this.p.x, y: this.p.y }));
          setTimeout(function(){life.destroy()},10000);
        }
        else
        {
          var oneOfTheSpecials = Math.floor((Math.random()*4)+1);
          switch(oneOfTheSpecials)
          {
            case 1: this.stage.insert(new Q.SpecialGun({ x: this.p.x, y: this.p.y }));
              break;
            case 2: this.stage.insert(new Q.SpecialSpeed({ x: this.p.x, y: this.p.y }));
              break;
            case 3: this.stage.insert(new Q.SpecialInvincibility({ x: this.p.x, y: this.p.y }));
              break;
            case 4: this.stage.insert(new Q.SpecialInvisibility({ x: this.p.x, y: this.p.y }));
              break;
          }
        }
        
        this.destroy();
      }
      else if(col.obj.isA("Player") || col.obj.isA("OtherPlayer1"))
      {
        this.p.x -= col.separate[0];
        this.p.y -= col.separate[1];
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
      setTimeout(function() { p.bulletInserted = false}, 80);
      setTimeout(function() { p.canFire = true}, 900);
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
    changeDirection: function(col) {
      var p = this.p;
      if(col.obj.isA("Player") || col.obj.isA("OtherPlayer1"))
      {
        return;
      }
        
      if(p.vx == 0 && p.vy == 0) {
        if(col.normalY) {
          p.direction = Math.random() < 0.5 ? 'left' : 'right';
        } else if(col.normalX) {
          p.direction = Math.random() < 0.5 ? 'up' : 'down';
        }
      }
    },

    tryToFire: function() {
      var p = this.p;
      var player = Q("Player").first();
      var otherPlayer = Q("OtherPlayer1").first();
     
      if(!player)
        return;
      if ((player.p.x + player.p.w > p.x && player.p.x - player.p.w < p.x && player.p.y < p.y && !player.p.invisible)) {
        p.direction = "up";
        this.fire();
      }
      else if ((player.p.x + player.p.w > p.x && player.p.x - player.p.w < p.x && player.p.y > p.y && !player.p.invisible)) {
        p.direction = "down";
        this.fire();
      }
      else if ((player.p.y + player.p.w > p.y && player.p.y - player.p.w < p.y && player.p.x < p.x && !player.p.invisible)) {
        p.direction = "left";
        this.fire();
      }
      else if ((player.p.y + player.p.w > p.y && player.p.y - player.p.w < p.y && player.p.x > p.x && !player.p.invisible)) {
        p.direction = "right";
        this.fire();
      }
      
    },
  });

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// PLAYER CLASSES /////////////////////////////////

 //Set up the animations for the player, reading frames from sprites.png
  Q.animations("player", {
    red_fire_right_running: {frames:[10,11,9,11,10], rate: 1/15},
    red_fire_left_running: {frames:[23,22,21,22,23], rate: 1/15},
    red_fire_front_running: {frames:[4,5], rate: 1/4},
    red_fire_back_running: {frames:[16,17], rate: 1/4},
    red_fire_standing_right: {frames:[9], rate: 1/4},
    red_fire_standing_left: {frames:[21], rate: 1/4},
    red_fire_standing_front: {frames:[3], rate: 1/4},
    red_fire_standing_back: {frames:[15], rate: 1/4},
    red_run_right: {frames:[7,6,8,6,7], rate: 1/15},
    red_run_left: {frames:[18,19,20,19,18], rate: 1/15},
    red_run_front: {frames:[0,1], rate: 1/5},
    red_run_back: {frames:[12,13], rate: 1/5},
    red_stand_right: {frames:[8], rate: 1/5},
    red_stand_left: {frames:[20], rate: 1/5},
    red_stand_front: {frames:[2], rate: 1/5},
    red_stand_back: {frames:[14], rate: 1/5},
    red_die:{frames:[24], rate: 1/5},
    green_fire_right_running: {frames:[35,36,34,36,35], rate: 1/15},
    green_fire_left_running: {frames:[48,47,46,47,48], rate: 1/15},
    green_fire_front_running: {frames:[29,30], rate: 1/4},
    green_fire_back_running: {frames:[41,42], rate: 1/4},
    green_fire_standing_right: {frames:[34], rate: 1/4},
    green_fire_standing_left: {frames:[46], rate: 1/4},
    green_fire_standing_front: {frames:[28], rate: 1/4},
    green_fire_standing_back: {frames:[40], rate: 1/4},
    green_run_right: {frames:[32,31,33,31,32], rate: 1/15},
    green_run_left: {frames:[43,44,45,44,43], rate: 1/15},
    green_run_front: {frames:[25,26], rate: 1/5},
    green_run_back: {frames:[37,38], rate: 1/5},
    green_stand_right: {frames:[33], rate: 1/5},
    green_stand_left: {frames:[45], rate: 1/5},
    green_stand_front: {frames:[27], rate: 1/5},
    green_stand_back: {frames:[39], rate: 1/5},
    green_die:{frames:[49], rate: 1/5},
    grey_fire_right_running: {frames:[35+25,36+25,34+25,36+25,35+25], rate: 1/15},
    grey_fire_left_running: {frames:[48+25,47+25,46+25,47+25,48+25], rate: 1/15},
    grey_fire_front_running: {frames:[29+25,30+25], rate: 1/4},
    grey_fire_back_running: {frames:[41+25,42+25], rate: 1/4},
    grey_fire_standing_right: {frames:[34+25], rate: 1/4},
    grey_fire_standing_left: {frames:[46+25], rate: 1/4},
    grey_fire_standing_front: {frames:[28+25], rate: 1/4},
    grey_fire_standing_back: {frames:[40+25], rate: 1/4},
    grey_run_right: {frames:[32+25,31+25,33+25,31+25,32+25], rate: 1/15},
    grey_run_left: {frames:[43+25,44+25,45+25,44+25,43+25], rate: 1/15},
    grey_run_front: {frames:[25+25,26+25], rate: 1/5},
    grey_run_back: {frames:[37+25,38+25], rate: 1/5},
    grey_stand_right: {frames:[33+25], rate: 1/5},
    grey_stand_left: {frames:[45+25], rate: 1/5},
    grey_stand_front: {frames:[27+25], rate: 1/5},
    grey_stand_back: {frames:[39+25], rate: 1/5},
    grey_die:{frames:[49+25], rate: 1/5},
    invisible_fire_right_running: {frames:[35+50,36+50,34+50,36+50,35+50], rate: 1/15},
    invisible_fire_left_running: {frames:[48+50,47+50,46+50,47+50,48+50], rate: 1/15},
    invisible_fire_front_running: {frames:[29+50,30+50], rate: 1/4},
    invisible_fire_back_running: {frames:[41+50,42+50], rate: 1/4},
    invisible_fire_standing_right: {frames:[34+50], rate: 1/4},
    invisible_fire_standing_left: {frames:[46+50], rate: 1/4},
    invisible_fire_standing_front: {frames:[28+50], rate: 1/4},
    invisible_fire_standing_back: {frames:[40+50], rate: 1/4},
    invisible_run_right: {frames:[32+50,31+50,33+50,31+50,32+50], rate: 1/15},
    invisible_run_left: {frames:[43+50,44+50,45+50,44+50,43+50], rate: 1/15},
    invisible_run_front: {frames:[25+50,26+50], rate: 1/5},
    invisible_run_back: {frames:[37+50,38+50], rate: 1/5},
    invisible_stand_right: {frames:[33+50], rate: 1/5},
    invisible_stand_left: {frames:[45+50], rate: 1/5},
    invisible_stand_front: {frames:[27+50], rate: 1/5},
    invisible_stand_back: {frames:[39+50], rate: 1/5},
    invisible_die:{frames:[49+50], rate: 1/5},
    blue_fire_right_running: {frames:[35+75,36+75,34+75,36+75,35+75], rate: 1/15},
    blue_fire_left_running: {frames:[48+75,47+75,46+75,47+75,48+75], rate: 1/15},
    blue_fire_front_running: {frames:[29+75,30+75], rate: 1/4},
    blue_fire_back_running: {frames:[41+75,42+75], rate: 1/4},
    blue_fire_standing_right: {frames:[34+75], rate: 1/4},
    blue_fire_standing_left: {frames:[46+75], rate: 1/4},
    blue_fire_standing_front: {frames:[28+75], rate: 1/4},
    blue_fire_standing_back: {frames:[40+75], rate: 1/4},
    blue_run_right: {frames:[32+75,31+75,33+75,31+75,32+75], rate: 1/15},
    blue_run_left: {frames:[43+75,44+75,45+75,44+75,43+75], rate: 1/15},
    blue_run_front: {frames:[25+75,26+75], rate: 1/5},
    blue_run_back: {frames:[37+75,38+75], rate: 1/5},
    blue_stand_right: {frames:[33+75], rate: 1/5},
    blue_stand_left: {frames:[45+75], rate: 1/5},
    blue_stand_front: {frames:[27+75], rate: 1/5},
    blue_stand_back: {frames:[39+75], rate: 1/5},
    blue_die:{frames:[49+75], rate: 1/5},
  });

  //Create the player object
  Q.Sprite.extend("Player", {
    init: function(p) {

      this._super(p,{
        sheet:"player",
        sprite:"player",
        frame: 24,
        type: Q.SPRITE_PLAYER,
        stepDelay: 0.1,
        life: 10,
        bulletSpeed: 1000,
        special: false,
        playerColor: "blue",
        leftbulletInserted: false,
        rightbulletInserted: false,
        upbulletInserted: false,
        downbulletInserted: false,
        specialBulletInserted: false,
        specialCanFire: false,
        specialInvisibilityCount: 0,
        specialInvincibilityCount: 0,
        specialSpeedCount: 0,
        keys: 0,
        canFire: true,
        beenHit: false,
        invisible: false,
        enemiesKilled: 0,
        specialBullets: 0,
        collisionMask: Q.SPRITE_TILES | Q.SPRITE_ENEMY | Q.SPRITE_ENEMY_BULLET | Q.SPRITE_LIFE | Q.SPRITE_TREES | Q.SPRITE_DOOR | Q.SPRITE_SPECIAL | Q.SPRITE_KEY
      });

      this.add("2d, stepControls, animation");
      Q.input.on("fireRight",this,"fireRight");
      Q.input.on("fireLeft",this,"fireLeft");
      Q.input.on("fireDown",this,"fireDown");
      Q.input.on("fireUp",this,"fireUp");
      Q.input.on("specialGun",this,"specialGun");
      this.on("hit.sprite",this,"hit");
      this.on("touchEnd",this,"fire");
    },

    click: function(touch) {
    alert("what the ");
    },

    hit: function(col) {
      var red;
      var p = this.p;
      if (col.obj.isA("Life")) {
        p.life++;
        Q.stageScene('hud', 3, p);
      }
      else if (col.obj.isA("Key")) {
        p.keys++;
        totalKeys++;
        Q.stageScene('hud', 3, p);
      }
      else if(col.obj.isA("SpecialSpeed")) {
        p.specialSpeedCount++;
        p.stepDelay = 0.05;
        p.bulletSpeed = 1300;
        setTimeout(function(){
          p.specialSpeedCount--;
          if (p.specialSpeedCount == 0) {
            p.bulletSpeed = 1000;
            p.stepDelay = 0.1;
          }
        }, 10000);
      }
      else if(col.obj.isA("SpecialInvisibility")) {
        p.specialInvisibilityCount++;
        p.invisible = true;
        setTimeout(function(){
          p.specialInvisibilityCount--;
          if(p.specialInvisibilityCount == 0) {
            p.invisible = false;
          }
        }, 10000);
        
      }
      else if(col.obj.isA("SpecialGun")) {
        p.specialCanFire = true;
        p.specialBullets += 5;
        Q.stageScene('hud', 3, p);
      }
      else if(col.obj.isA("SpecialInvincibility")) {
        p.specialInvincibilityCount++;
        p.life = 100;
        Q.stageScene('hud', 3, p);
        setTimeout(function(){
          p.specialInvincibilityCount--;
          if (p.specialInvincibilityCount == 0) {
            p.life = 10;
            Q.stageScene('hud', 3, p);
          }
        }, 10000);
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
        socket.emit('death');
      }
    },

    specialGun: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.specialCanFire)
        return;
      p.specialCanFire = false;
      //check to see if he has the special and if he still has bullets
      if (p.specialBullets) {          
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
    },

    SpecialInvincibility: function() {
      var p = this.p;
      if (!p.specialCanJesus)
        return;
      p.specialCanJesus = false;
    },

    fireLeft: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.canFire)
        return;
      p.canFire = false;
      p.direction = "left";
      angle = -90;
      x = this.p.x - 47;
      y = this.p.y + 2;

      var dx =  Math.sin(angle * Math.PI / 180),
          dy = -Math.cos(angle * Math.PI / 180);
      p.leftbulletInserted = true;
      //Insert the bullet into the stage
      this.stage.insert(
        new Q.PlayerBullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );
      socket.emit('fire bullet', { px: p.x, py: p.y, po: "left" });
      setTimeout(function() { p.leftbulletInserted = false}, 80);
      setTimeout(function() { p.canFire = true}, 200);
    },
    fireRight: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.canFire)
        return;
      p.canFire = false;
      p.direction = "right";
      angle = 90;
      x = this.p.x + 47;
      y = this.p.y + 2;

      var dx =  Math.sin(angle * Math.PI / 180),
          dy = -Math.cos(angle * Math.PI / 180);
      p.rightbulletInserted = true;
      //Insert the bullet into the stage
      this.stage.insert(
        new Q.PlayerBullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );
      socket.emit('fire bullet', { px: p.x, py: p.y, po: "right" });
      setTimeout(function() { p.rightbulletInserted = false}, 80);
      setTimeout(function() { p.canFire = true}, 200);
    },
    fireUp: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.canFire)
        return;
      p.canFire = false;
      
      p.direction = "up";
      angle = 0;
      x = this.p.x - 8;
      y = this.p.y - 60;

      var dx =  Math.sin(angle * Math.PI / 180),
          dy = -Math.cos(angle * Math.PI / 180);
      p.upbulletInserted = true;
      //Insert the bullet into the stage
      this.stage.insert(
        new Q.PlayerBullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );
      socket.emit('fire bullet', { px: p.x, py: p.y, po: "up" });
      setTimeout(function() { p.upbulletInserted = false}, 80);
      setTimeout(function() { p.canFire = true}, 200);
    },
    fireDown: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.canFire)
        return;
      p.canFire = false;
      p.direction = "down";
      angle = 180;
      x = this.p.x + 10;
      y = this.p.y + 60;

      var dx =  Math.sin(angle * Math.PI / 180),
          dy = -Math.cos(angle * Math.PI / 180);
      p.downbulletInserted = true;
      //Insert the bullet into the stage
      this.stage.insert(
        new Q.PlayerBullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );
      socket.emit('fire bullet', { px: p.x, py: p.y, po: "down" });
      setTimeout(function() { p.downbulletInserted = false}, 80);
      setTimeout(function() { p.canFire = true}, 200);
    },
    
    //step function for controlling how this sprite will move
    step: function(dt) {
      if (this.p.playerColor == "red") {
        this.p.frame = 2;
      }
      else if (this.p.playerColor == "blue") {
        this.p.frame = 102;
      }
      else if (this.p.playerColor == "green") {
        this.p.frame = 27;
      }
      else if (this.p.playerColor == "grey") {
        this.p.frame = 52;
      }
      //Grab the input and determine which animation to play
      if(Q.inputs["right"]) {
        //set the direction of the player depending on the input
        this.p.direction = "right";

        //play the fire animation if input reads that the player is firing,
        //else just play the running animation
        if (this.p.specialBulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_right_running");
          }
          else {
            this.play(this.p.playerColor + "_fire_right_running");
          }
          
        }
        else if (this.p.leftbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_left_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_left_running")
          }
        }
        else if (this.p.rightbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_right_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_right_running")
          }
        }
        else if (this.p.upbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_back_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_back_running")
          }
        }
        else if (this.p.downbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_front_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_front_running")
          }
        }
        else {
          if (this.p.invisible) {
            this.play("invisible_run_right");
          }
          else {
            this.play(this.p.playerColor + "_run_right");
          }
          
        }
      } else if(Q.inputs["left"]) {
        this.p.direction = "left";
        if (this.p.specialBulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_left_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_left_running")
          }
        }
        else if (this.p.leftbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_left_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_left_running")
          }
        }
        else if (this.p.rightbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_right_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_right_running")
          }
        }
        else if (this.p.upbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_back_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_back_running")
          }
        }
        else if (this.p.downbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_front_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_front_running")
          }
        }
        else {
          if (this.p.invisible) {
            this.play("invisible_run_left");
          }
          else {
            this.play(this.p.playerColor + "_run_left");
          }
          
        }
      }
      else if(Q.inputs["up"]) {
        this.p.direction = "up";
        if (this.p.specialBulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_back_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_back_running")
          }
        }
        else if (this.p.leftbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_left_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_left_running")
          }
        }
        else if (this.p.rightbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_right_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_right_running")
          }
        }
        else if (this.p.upbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_back_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_back_running")
          }
        }
        else if (this.p.downbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_front_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_front_running")
          }
        }
        else {
          if (this.p.invisible) {
            this.play("invisible_run_back");
          }
          else {
            this.play(this.p.playerColor + "_run_back");
          }
          
        }
      } else if(Q.inputs["down"]) {
        this.p.direction = "down";
        if (this.p.specialBulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_front_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_front_running")
          }
        }
        else if (this.p.leftbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_left_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_left_running")
          }
        }
        else if (this.p.rightbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_right_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_right_running")
          }
        }
        else if (this.p.upbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_back_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_back_running")
          }
        }
        else if (this.p.downbulletInserted) {
          if (this.p.invisible) {
            this.play("invisible_fire_front_running")
          }
          else {
            this.play(this.p.playerColor + "_fire_front_running")
          }
        }
        else {
          if (this.p.invisible) {
            this.play("invisible_run_front");
          }
          else {
            this.play(this.p.playerColor + "_run_front");
          }
        }
      }
      else {
        if (this.p.specialBulletInserted || this.p.downbulletInserted || this.p.upbulletInserted || this.p.leftbulletInserted || this.p.rightbulletInserted) {
          if (this.p.direction == "right") {
            if (this.p.invisible) {
              this.play("invisible_fire_standing_right"); 
            }
            else {
              this.play(this.p.playerColor + "_fire_standing_right"); 
            }
          } else if (this.p.direction == "left") {
            if (this.p.invisible) {
              this.play("invisible_fire_standing_left");
            }
            else {
              this.play(this.p.playerColor + "_fire_standing_left");
            }
          } else if (this.p.direction == "up") {
            if (this.p.invisible) {
              this.play("invisible_fire_standing_back");
            }
            else {
              this.play(this.p.playerColor + "_fire_standing_back");
            }
          } else if (this.p.direction == "down") {
            if (this.p.invisible) {
              this.play("invisible_fire_standing_front");
            }
            else {
              this.play(this.p.playerColor + "_fire_standing_front");
            }
          }
          
        }
        else {
          if (this.p.direction == "right") {
            if (this.p.invisible) {
              this.play("invisible_stand_right"); 
            }
            else {
              this.play(this.p.playerColor + "_stand_right"); 
            }
          } else if (this.p.direction == "left") {
            if (this.p.invisible) {
              this.play("invisible_stand_left"); 
            }
            else {
              this.play(this.p.playerColor + "_stand_left"); 
            }
          } else if (this.p.direction == "up") {
            if (this.p.invisible) {
              this.play("invisible_stand_back"); 
            }
            else {
              this.play(this.p.playerColor + "_stand_back"); 
            }
          } else if (this.p.direction == "down") {
            if (this.p.invisible) {
              this.play("invisible_stand_front"); 
            }
            else {
              this.play(this.p.playerColor + "_stand_front"); 
            }
          }
        }
      }
    },
  });

  //Create the other player object
  Q.Sprite.extend("OtherPlayer1", {
    init: function(p) {

      this._super(p,{
        sheet:"player",
        sprite:"player", 
        frame: 24,
        type: Q.SPRITE_OTHER_PLAYER,
        stepDelay: 0.1,
        life: 10,
        bulletSpeed: 1000,
        playerColor: "red",
        special: false,
        bulletInserted: false,
        specialBulletInserted: false,
        specialCanFire: false,
        specialInvisibilityCount: 0,
        specialInvincibilityCount: 0,
        specialSpeedCount: 0,
        keys: 0,
        canFire: true,
        beenHit: false,
        invisible: false,
        enemiesKilled: 0,
        specialBullets: 0,
        pid: "",
        collisionMask: Q.SPRITE_TILES | Q.SPRITE_ENEMY | Q.SPRITE_ENEMY_BULLET | Q.SPRITE_LIFE | Q.SPRITE_TREES | Q.SPRITE_DOOR | Q.SPRITE_SPECIAL | Q.SPRITE_KEY 
      });

      this.add("2d, animation");
      this.on("step", this, "animate");
      //Q.input.on("fire",this,"fire");
      //Q.input.on("specialGun",this,"specialGun");
      // this.on("hit.sprite",this,"hit");
    },

    /*
    hit: function(col) {
      var red;
      var p = this.p;
      if (col.obj.isA("Life")) {
        p.life++;
      }
      else if (col.obj.isA("Key")) {
        p.keys++;
      }
      else if(col.obj.isA("SpecialSpeed")) {
        p.specialSpeedCount++;
        p.stepDelay = 0.05;
        p.bulletSpeed = 1300;
        setTimeout(function(){
          p.specialSpeedCount--;
          if (p.specialSpeedCount == 0) {
            p.bulletSpeed = 1000;
            p.stepDelay = 0.1;
          }
        }, 10000);
      }
      else if(col.obj.isA("SpecialInvisibility")) {
        p.specialInvisibilityCount++;
        p.invisible = true;
        setTimeout(function(){
          p.specialInvisibilityCount--;
          if(p.specialInvisibilityCount == 0) {
            p.invisible = false;
          }
        }, 10000);
        
      }
      else if(col.obj.isA("SpecialGun")) {
        p.specialCanFire = true;
        p.specialBullets += 5;
      }
      else if(col.obj.isA("SpecialInvincibility")) {
        p.specialInvincibilityCount++;
        p.life = 100;
        setTimeout(function(){
          p.specialInvincibilityCount--;
          if (p.specialInvincibilityCount == 0) {
            p.life = 10;
          }
        }, 10000);
      }
      else if((col.obj.isA("Enemy") || col.obj.isA("EnemyBullet")) && !p.beenHit) {
        p.beenHit = true;
        p.life--;
        red = this.stage.insert(new Q.TileLayer({ dataAsset: 'redScreen.json', sheet: 'tiles', type: Q.SPRITE_RED }));
        setTimeout(function(){red.destroy()},200);
        setTimeout(function(){p.beenHit = false}, 200);
      }

      if (p.life == 0) {
        this.destroy();
      }
    },
*/
    specialGun: function() {
      var p = this.p;
      var angle, x, y;
      if (!p.specialCanFire)
        return;
      p.specialCanFire = false;
      //check to see if he has the special and if he still has bullets
      if (p.specialBullets) {          
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
      }
    },

    SpecialInvincibility: function() {
      var p = this.p;
      if (!p.specialCanJesus)
        return;
      p.specialCanJesus = false;
    },

    fire: function(po) {
      // console.log("I fired");
      var p = this.p;
      var angle, x, y;
 /*     if (!p.canFire)
        return;
      p.canFire = false;*/
      //See what direction the player is in and set the bullet to go that way
      if (po == "left") {
        angle = -90;
        x = this.p.x - 47;
        y = this.p.y + 2;
      } else if (po == "right") {
        angle = 90;
        x = this.p.x + 47;
        y = this.p.y + 2;
      } else if (po == "up") {
        angle = 0;
        x = this.p.x - 8;
        y = this.p.y - 60;
      } else if (po == "down") {
        angle = 180;
        x = this.p.x + 10;
        y = this.p.y + 60;
      }
      var dx =  Math.sin(angle * Math.PI / 180),
          dy = -Math.cos(angle * Math.PI / 180);
     // p.bulletInserted = true;
      //Insert the bullet into the stage
      this.stage.insert(
        new Q.PlayerBullet({ x: x, 
                       y: y,
                       vx: dx * p.bulletSpeed,
                       vy: dy * p.bulletSpeed
                })
      );      
      // console.log("bullet " + x + " " + y);
     // setTimeout(function() { p.bulletInserted = false}, 80);
     // setTimeout(function() { p.canFire = true}, 200);
    },
    
    //step function for controlling how this sprite will move
    animate: function(po, pf) {
      if (this.p.playerColor == "red") {
        this.p.frame = 2;
      }
      else if (this.p.playerColor == "blue") {
        this.p.frame = 102;
      }
      else if (this.p.playerColor == "green") {
        this.p.frame = 27;
      }
      else if (this.p.playerColor == "grey") {
        this.p.frame = 52;
      }
      //Grab the input and determine which animation to play
      if(po == "right") {
        //set the direction of the player depending on the input
        this.p.direction = "right";

        //play the fire animation if input reads that the player is firing,
        //else just play the running animation
        if (pf == "true") {
          this.play(this.p.playerColor + "_fire_right_running");
        }
         else {
            this.play(this.p.playerColor + "_run_right");
        }
      } else if (po == "left") {
        this.p.direction = "left";
        if (pf == "true") {
          this.play(this.p.playerColor + "_fire_left_running")
        }
        else {
          this.play(this.p.playerColor + "_run_left");
        }
      }
      else if (po == "up") {
        this.p.direction = "up";
        if (pf == "true") {
          this.play(this.p.playerColor + "_fire_back_running")
        }
        else {
          this.play(this.p.playerColor + "_run_back");
        }
      } else if (po == "down") {
        this.p.direction = "down";
        if (pf == "true") {
          this.play(this.p.playerColor + "_fire_front_running")
        }
        else {
          this.play(this.p.playerColor + "_run_front");
        }
      }
      else {
        if (pf == "true") {
          if (this.p.direction == "right") {
            this.play(this.p.playerColor + "_fire_standing_right"); 
          } else if (this.p.direction == "left") {
            this.play(this.p.playerColor + "_fire_standing_left");
          } else if (this.p.direction == "up") {
            this.play(this.p.playerColor + "_fire_standing_back");
          } else if (this.p.direction == "down") {
            this.play(this.p.playerColor + "_fire_standing_front");
          }
          
        }
        else {
          var color = this.p.playerColor;
          if (this.p.direction == "right") {
            setTimeout(this.play(color + "_stand_right"),1000);
          } else if (this.p.direction == "left") {
            setTimeout(this.play(color + "_stand_left"),1000);
          } else if (this.p.direction == "up") {
            setTimeout(this.play(color + "_stand_back"),1000);
          } else if (this.p.direction == "down") {
            setTimeout(this.play(color + "_stand_front"),1000);
          }
        }
      }
    },
  });

//////////////////////////// PLAYER CLASSES ABOVE //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// HUD AND OSD //////////////////////////////////
  
  //HUD
  Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({x: 60, y: 0}));

  var health = container.insert(new Q.UI.Text({x:30, y: 20,
    label: "Health: " + stage.options.life, color: "green" }));

  var specialBullets = container.insert(new Q.UI.Text({x:380 -170, y: 20,
    label: "Special Bullets: " + stage.options.specialBullets, color: "white" }));

  var hasKey = container.insert(new Q.UI.Text({x:545 -170, y: 20,
    label: "Keys: " + stage.options.keys, color: "white" }));

  var controls = container.insert(new Q.UI.Text({x:1050, y: 20,
    label: "Move: WASD, Shoot: IJKL, Special: 'SPACE'", color: "white" }));
  container.fit(20);
});

  //Main game screen
  Q.scene("mainMenu",function(stage) {
    //Set up the main screen and buttons
  });

//////////////////////////// HUD AND OSD ABOVE /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// LEVELS //////////////////////////////////////

  //main menu
  Q.scene('mainMenu',function(stage) {
    var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.5)"
    }));

    var tutorial = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                   label: "Tutorial Mode" })) 
    var story = container.insert(new Q.UI.Button({ x: 0, y: 80, fill: "#CCCCCC",
                                                   label: "Story Mode (Co Op)" }))     
    var multiplayer = container.insert(new Q.UI.Button({ x: 0, y: 160, fill: "#CCCCCC",
                                                   label: "Multiplayer Mode (Free for All)" })) 
    var options = container.insert(new Q.UI.Button({ x: 0, y: 240, fill: "#CCCCCC",
                                                   label: "Options" }))      
    var label = container.insert(new Q.UI.Text({x:8, y: - 10 - tutorial.p.h, 
                                 label: stage.options.label }));
    
    // When the buttons are clicked, clear all the stages
    // and restart the level or go to main menu.
    tutorial.on("click",function() {
      Q.clearStages();
      Q.stageScene("tutorial",1, { label: "Tutorial" });
      Q.stageScene('hud', 3, Q('Player').first().p);
    });
    story.on("click",function() {
      loadCoOp();
    });
    multiplayer.on("click",function() {
      Q.clearStages();
      Q.stageScene("multiplayer",1, { label: "Multiplayer" });
    });
    options.on("click",function() {
      Q.clearStages();
      Q.stageScene("options",1, { label: "Options" });
    }); 

    //Expand the container to visibily fit it's contents
    container.fit(80);
  });

  //Scene that occurs after game ends
  Q.scene('tutorial',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.5)"
    }));

    var mainMenu = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                   label: "Main Menu" }))      
    var label = container.insert(new Q.UI.Text({x:8, y: - 10 - mainMenu.p.h, 
                                 label: stage.options.label }));
    
    // When the buttons are clicked, clear all the stages
    // and restart the level or go to main menu.
    mainMenu.on("click",function() {
      Q.clearStages();
      Q.stageScene("mainMenu",1, { label: "Main Menu" });
    });
    
    //Expand the container to visibily fit it's contents
    container.fit(20);
  });

  //Scene that occurs after game ends
  Q.scene('options',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.5)"
    }));

    var mainMenu = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                   label: "Main Menu" }))      
    var label = container.insert(new Q.UI.Text({x:8, y: - 10 - mainMenu.p.h, 
                                 label: stage.options.label }));
    
    // When the buttons are clicked, clear all the stages
    // and restart the level or go to main menu.
    mainMenu.on("click",function() {
      Q.clearStages();
      Q.stageScene("mainMenu",1, { label: "Main Menu" });
    });
    
    //Expand the container to visibily fit it's contents
    container.fit(20);
  });

  //Scene that occurs after game ends
  Q.scene('multiplayer',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.5)"
    }));

    var mainMenu = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                   label: "Main Menu" }))      
    var label = container.insert(new Q.UI.Text({x:8, y: - 10 - mainMenu.p.h, 
                                 label: stage.options.label }));
    
    // When the buttons are clicked, clear all the stages
    // and restart the level or go to main menu.
    mainMenu.on("click",function() {
      Q.clearStages();
      Q.stageScene("mainMenu",1, { label: "Main Menu" });
    });
    
    //Expand the container to visibily fit it's contents
    container.fit(20);
    
  });

  //First level
  Q.scene("level1",function(stage) {
    totalEnemiesKilled = 0;
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1Collision.json', sheet: 'tiles', type: Q.SPRITE_TILES }));
    stage.insert(new Q.TileLayer({ dataAsset: 'level1Background.json', sheet: 'tiles', type: Q.SPRITE_NONE }));

    var player = stage.insert(new Q.Player({ x: 700, y: 700 }));
    var enemy = stage.insert(new Q.Enemy({ x: 1000, y: 1000 }));
    stage.insert(new Q.Tree1({ x: 500, y: 500 }));
    stage.insert(new Q.Tree2({ x: 400, y: 400 }));


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
    //variables to keep track of enemies killed and to let the certain functions
    //know that level2 is running.
    totalEnemiesKilled = 0;
    level2IsRunning = true;

    //insert the collision layer and background layer
    stage.insert(new Q.TileLayer({ dataAsset: 'level2Background.json', sheet: 'tiles', type: Q.SPRITE_NONE }));
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level2Collision.json', sheet: 'tiles', type: Q.SPRITE_TILES }));
    
    //insert the trees
    stage.insert(new Q.Tree1({ x: 200, y: 100 })); //top left
    stage.insert(new Q.Tree2({ x: 150, y: 200 })); //top left
    stage.insert(new Q.Tree1({ x: 150, y: 550 }));
    stage.insert(new Q.Tree1({ x: 2200, y: 100 }));
    stage.insert(new Q.Tree1({ x: 1000, y: 1350 }));
    stage.insert(new Q.Tree1({ x: 2050, y: 1600 }));
    stage.insert(new Q.Tree2({ x: 2150, y: 1600 }));
    stage.insert(new Q.Tree1({ x: 2350, y: 1600 }));

    //insert the doors
    topDoor = stage.insert(new Q.horizontalDoor({ x: 1328, y: 880 + moveY}));
    bottomDoor = stage.insert(new Q.horizontalDoor({ x: 1328, y: 1647 + moveY}));
    leftDoor = stage.insert(new Q.verticalDoor({ x: 816, y: 1264 + moveY}));
    rightDoor = stage.insert(new Q.verticalDoor({ x: 1840, y: 1264 + moveY}));
    
    //insert the player
    currentPlayer = stage.insert(new Q.Player({ x: 1300, y: 1200 + moveY}));
    
    //insert the enemies
    // stage.insert(new Q.Enemy({ x: 1800, y: 1500 + moveY})); // spawn room
    stage.insert(new Q.Enemy({ x: 1350, y: 1800 + moveY})); //bottom
    stage.insert(new Q.Enemy({ x: 1350, y: 2000 + moveY})); //bottom 
    stage.insert(new Q.Enemy({ x: 2000, y: 1200 + moveY})); //right
    stage.insert(new Q.Enemy({ x: 500, y: 2000 + moveY})); //left
    stage.insert(new Q.Enemy({ x: 600, y: 2000 + moveY})); //left
    stage.insert(new Q.Enemy({ x: 700, y: 2000 + moveY})); //left
    stage.insert(new Q.Enemy({ x: 200, y: 200 + moveY})); //top
    stage.insert(new Q.Enemy({ x: 300, y: 300 + moveY})); //top
    stage.insert(new Q.Enemy({ x: 2000, y: 300 + moveY})); //top
   
    //Set viewport to follow player
    stage.add("viewport").follow(currentPlayer);

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
                                                   label: "Main Menu" }))        
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
      Q.stageScene("mainMenu",1, { label: "Main Menu" });
    });

    //Expand the container to visibily fit it's contents
    container.fit(20);
  });
/*
  ///Load and start the level
  Q.load("sprites.png, sprites.json, level1Collision.json, level1Background.json, tiles.png, redScreen.json, level2Collision.json, level2Background.json", function() {
    Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 }); 
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("mainMenu",1, { label: "Main Menu" }); 
  });
*/
});