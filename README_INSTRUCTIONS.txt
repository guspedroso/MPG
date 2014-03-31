+------------------------------------------------------------------------------+
|                          CSCE 315 FINAL PROJECT                              |
|                                HTML 5 GAME                                   |
|                                                                              |
|         TERRY CHEN      GUS PEDROSO      DANIEL HE      LEVI CLARK           |
|                                                                              |
|                       INSTRUCTIONS FOR HOW TO RUN                            |
|                                                                              |
+------------------------------------------------------------------------------+

********************************************************************************
** Important!: The following instructions assume that you are within the CSCE
               domain, either through the CS VPN, or through using a CSCE Lab 
               computer.
********************************************************************************

1) Unzip the game folder

2) Change Directory into the unzipped game folder. 
   From that directory, run the following command on the compute server:
   > node app.js
   The server will begin and listen on port 12315.

3) Open a web browser, and navigate to 
   > "http://compute:12315"

4) The game should begin to load within your browser. 

<< THE FOLLOWING INSTRUCTIONS WILL EXPLAIN HOW TO EXPERIENCE THE GAME >> 

  The controls are as follows:

    o Movement:
      - W to move up
      - A to move left
      - S to move down
      - D to move right
       ~ alternatively ~
      - UP_ARROW to move up
      - LEFT_ARROW to move left
      - DOWN_ARROW to move down
      - RIGHT_ARROW to move right

    o Actions:
      - J to utilize special attack
      - SPACEBAR to fire primary weapon

  Your primary objective is to kill the enemies. Do so by moving around, aiming 
  at the enemies by changing your direction with the arrow keys, and firing your
  weapon. If you successfully kill an enemy, they will drop a "special" item. 
  This item will last for 10 seconds, and enables you to fire several high-power
  rounds which will explode upon impact and instantly kill enemies. 

  You have 10 health points. For every instance of damage taken from the
  enemies, your health will be deducted by 1. If your health drops to zero, then
  you die and the game will end. 