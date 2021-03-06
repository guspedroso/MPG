var Enemy = function(startX, startY) {
  var x = startX;
  var y = startY;
  var id;
  var health = 5;

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


  return {
    getX: getX,
    getY: getY,
    getHealth: getHealth,
    setX: setX,
    setY: setY,
    setHealth: setHealth,
    id: id
  }

};
