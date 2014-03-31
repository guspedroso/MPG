+------------------------------------------------------------------------------+
|                          CSCE 315 FINAL PROJECT                              |
|                                HTML 5 GAME                                   |
|                                                                              |
|         TERRY CHEN      GUS PEDROSO      DANIEL HE      LEVI CLARK           |
|                                                                              |
|                   OVERVIEW AND INVENTORY OF SOURCE CODE                      |
|                                                                              |
+------------------------------------------------------------------------------+

./
 |
 | app.js - This is the server script
 | 
 | client/
 |       | index.html ----- This is the client side index and socket code
 |       | 
 |       | quintus-all.js - This is our game engine's code (Quintus)
 |       | 
 |       | test.js -------- This is our game's code
 |       | 
 |       | classes/
 |       |        | Enemy.js ----- This is the enemy class
 |       |        | Player.js ---- This is the player class
 |       | 
 |       | data/
 |       |     | allDoorsOpen.json ----------- This is the mapping for a map with fully opened doors
 |       |     | bottomDoorOpen.json --------- This is the mapping for a map with only the bottom door opened
 |       |     | leftDoorOpen.json ----------- This is the mapping for a map with only the left door opened
 |       |     | leftTopDoorOpen.json -------- This is the mapping for a map with the left and top door opened
 |       |     | leftTopRightDoorOpen.json --- This is the mapping for a map with the left, top, and right door opened
 |       |     | level1Background.json ------- This is the mapping for the level 1 map
 |       |     | level1Collision.json -------- This is the collision mapping for the level 1 map
 |       |     | level2Background.json ------- This is the mapping for the level 2 map
 |       |     | level2Collision.json -------- This is the collision mapping for the level 2 map
 |       |     | mainMenuBackground.json ----- This is the mapping for the main menu's background
 |       |     | redScreen.json -------------- This is what flashes the screen red upon damage taken
 |       |     | rightDoorOpen.json ---------- This is the mapping for a map with only the right door opened
 |       |     | sprites.json ---------------- This is the configuration for the sprites
 |       |     | topDoorOpen.json ------------ This is the mapping for map with only the top door opened              
 |       | 
 |       | images/
 |               | sprites.png ---- These are the sprites and environment graphics
 |               | tiles.png ------ These are colored tiles for backgrounds      
 |               
 | node_modules/
 |             | .bin/
 |             | node-static/ --- This directory contains the node-static library
 |             | socket.io ------ This directory contains the Socket.io library
 | server/
         | Enemy.js ----- This is the enemy class
         | Player.js ---- This is the player class