var Enemy = function(startX, startY) {
  var x = startX;
  var y = startY;
  var id;
  var special;
  var health = 10;

  function getX() {
    return x;
  };

  function getY() {
    return y;
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

  function setSpecial(specialSpec) {
    special = specialSpec;
  };

  return {
    getX: getX,
    getY: getY,
    getHealth: getHealth,
    getSpecial: getSpecial,
    setX: setX,
    setY: setY,
    setHealth: setHealth,
    setSpecial: setSpecial,
    id: id
  }

};

exports.Enemy = Enemy;