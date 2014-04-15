var Enemy = function(startX, startY, idNew, type) {
  var x = startX;
  var y = startY;
	var t = type;
  var id = idNew;
  var health = 5;

  function getX() {
    return x;
  };

  function getY() {
    return y;
  };
	
	function getT() {
    return t;
  };
	
	function getID(){
		return id;
	};

  function getHealth() {
    return health;
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


  return {
    getX: getX,
    getY: getY,
		getT: getT,
		getID: getID,
    getHealth: getHealth,
    setX: setX,
    setY: setY,
    setHealth: setHealth,
    id: id,
		t: t
  }

};

exports.Enemy = Enemy;