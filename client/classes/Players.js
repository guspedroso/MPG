var Player = function(startX, startY, idNew, type) {
  var x = startX;
  var y = startY;
	var t = type;
  var id = idNew;
  var special;
  var health = 10;

  function getX() {
    return x;
  };

  function getY() {
    return y;
  };
	
  function getT() {
    return t;
  };
  
  function getID() {
    return id;
  };

  function getHealth() {
    return health;
  };

  function getSpecial() {
    return special;
  };

  function setX(xNew) {
    x = xNew;
  };

  function setY(yNew) {
    y = yNew;
  };

  function setHealth(healthNew) {
    health = healthNew;
  };

  function setSpecial(specialSpec) {
    special = specialSpec;
  };

  return {
    getX: getX,
    getY: getY,
		getT: getT,
    getID: getID,
    getHealth: getHealth,
    getSpecial: getSpecial,
    setX: setX,
    setY: setY,
    setHealth: setHealth,
    setSpecial: setSpecial,
    id: id,
		t: t
  }

};

//exports.Player = Player;