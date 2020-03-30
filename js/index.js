// ids used accross this script
var configuration = {
  withUI: true,
  snap: null,
  group: null,
  players: [],
  containers: {
    winner: 'winner',
    circlePit: 'circlePit',
    pointer: 'pointer',
    result: 'result'
  },
  spin: function() { return spin();},
}

Array.prototype.equals = function (array) {
    // compare lengths - can save a lot of time 
    if (!array || (this.length != array.length)) {
        return false;
    }

    for (var i = 0; i < array.length; i++) {
        // Check if we have nested arrays
        if (this[i] != array[i]) { 
            return false;   
        }           
    }       
    return true;
}

function designDefault() {
  configuration.snap = new Snap('#' + configuration.containers.circlePit);
  configuration.snap.attr({
	  fill: '#A0A6A0'
	});
}

function init(playersDef, centerX = 400, centerY = 200, radius = 130) {
  if (playersDef.equals(configuration.players)) {
    return;
  } 
  configuration.players = playersDef;

  if (configuration.snap) {
    configuration.snap.clear();
  } else {
    designDefault();
  }
 
  // Background Circle
  configuration.snap.circle(centerX, centerY, radius);

  // To set the papers for pushing it into the element
  var papers = configuration.snap.selectAll();
  papers.clear();

  var initialAngle = 0;
  var sectorAngle = 360 / configuration.players.length;

  for (var i = 0; i < configuration.players.length; i++) {
    var endAngle = initialAngle + sectorAngle;
    var sectorCoords = getSectorCoords(centerX, centerY, radius, initialAngle, endAngle)
    var sectorPath = drawSector(centerX, centerY, radius, sectorCoords, (configuration.players.length - i) / configuration.players.length);

    // Center point of x
    var mpx2 = (centerX + (sectorCoords.x1 + sectorCoords.x2) / 2) / 2;
    var mpy2 = (centerY + (sectorCoords.y1 + sectorCoords.y2) / 2) / 2;

    // Text
    var textContent = displayText(mpx2, mpy2, i, sectorAngle);

    var sectors = configuration.snap.group(sectorPath, textContent);
    papers.push(sectors);
    initialAngle = endAngle;
  }
  configuration.group = configuration.snap.group(papers);
  
  drawPointer(centerX, centerY, radius);
}

function getSectorCoords(centerX, centerY, radius, startAngle, endAngle) {
  var coords = {};
  coords.x1 = parseFloat(centerX + radius * Math.cos(-startAngle * Math.PI / 180));
  coords.x2 = parseFloat(centerX + radius * Math.cos(-endAngle * Math.PI / 180));
  coords.y1 = parseFloat(centerY + radius * Math.sin(-startAngle * Math.PI / 180));
  coords.y2 = parseFloat(centerY + radius * Math.sin(-endAngle * Math.PI / 180));
  return coords;
}

function drawSector(centerX, centerY, radius, coords, opacity) {    
  var sectorPath = "M " + centerX + " " + centerY + " L" + coords.x1 + " " + coords.y1 + " A" + radius + " " + radius + " 0 0 0 " + coords.x2 + "  " + coords.y2 + "z";
  return configuration.snap.path(sectorPath).attr({
      opacity: opacity,
      class: 'sectors',
  });
}

function displayText(x, y, i, sectorAngle) {
  var nominee = configuration.players[i];
  var text = configuration.snap.text(x, y, nominee);
  var heightTransform = text.getBBox().height / 4;
  var transformText = 't0,' + heightTransform + 'r-'+ ((i + 1) * sectorAngle - sectorAngle + sectorAngle / 2) + ',' + x + ',' + (y - heightTransform);
  text.transform(transformText);
  return text;
}  

function drawPointer (centerX, centerY, radius) {
  var pointerElement = document.getElementById(configuration.containers.pointer);
  if (pointerElement) {
    document.getElementById(configuration.containers.circlePit).removeChild(pointerElement);
  }
  // Selector Handle
  var tpx1 = centerX + 25;
  var tpx2 = centerX - 25;
  var tpcy = centerY - radius - 10;
  var tpy1 = tpcy + 25;

  var trianglePoly = tpx1 + ',' + tpcy + ' ' + centerX + ',' + tpy1 + ' ' + tpx2 + ',' + tpcy; 

  var triangle = configuration.snap.polyline(trianglePoly);
  triangle.attr({
      id: configuration.containers.pointer,
      class: "pointer"
  });
}

function getInputPlayers() {
  var p = document.getElementById("playersDefinition").value;
  var playersDef = p.split('\n');
  return playersDef;
}

function spin() {
  if (configuration.withUI) {
    var playersDef = getInputPlayers();
    var resultContainer = document.getElementById(configuration.containers.result);
    resultContainer.style.opacity = 0;
    var centerX = document.getElementById(configuration.containers.circlePit).width.baseVal.value / 2;
    var centerY = document.getElementById(configuration.containers.circlePit).height.baseVal.value / 2;
    var radius = document.getElementById(configuration.containers.circlePit).height.baseVal.value * 0.4;
  
    init(playersDef, centerX, centerY, radius);  
  }
  
  var angle = randomization();
  var realAngle = (90 + angle) % 360;
  var index = Math.floor(realAngle / (360 / configuration.players.length));  
  var winner = configuration.players[index];
  if (configuration.withUI) {
    configuration.group.animate({ transform: 'r' + angle + ',' + centerX + ',' + centerY }, 3000, mina.easeinout, function() {
      // Define winner 
      displayWinner(winner);
    });
  }
  return winner;
}

function displayWinner (winnerName) {
  var winnerContainer = document.getElementById(configuration.containers.winner);
  winnerContainer.textContent = winnerName;
  var resultContainer = document.getElementById(configuration.containers.result);
  resultContainer.style.opacity = 1;
}

// Generating Random Number 
function randomization(){
  var randomAngle = Math.random() * 360;
  var numberOfTurns = Math.random() * 15; 
  var rotation = numberOfTurns * 360 + randomAngle;

  return rotation;
}