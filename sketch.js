var mobile = false;

var recreateCanvas_factor = 1.8;
if(mobile) recreateCanvas_factor = 1;

var w = 8;
var h = 8 + 5;
var header_num = 5;
var mode = 2;

var time = 0;
var coolDownTime = 500;
let canPress = true, isDragging = false;
var mx = 0, my = 0;

var q = 35*recreateCanvas_factor; //blocks width and height
var dt; // delay between each move
var currentTime;
var grid;
var piece;
var nextPiece;
var pieces;
var score;
//var r = 0; //rotation status, from 0 to 3
var level = 1;
var nbLines = 0;

var txtSize = 30;
var textColor,backgroundColor;
var background_img;

var gameOver = false;
var gameOn = false;
var conditional_fall = false;
var frozenAtBeginning = false;
var preview = false;
var preview_outline = false;


//frozen means the tetris will remain still at the top for a while before falling
var frozen = frozenAtBeginning;
var frozenCount = 0;
var frozenCountMax = 10; //frozen time is frozenCountMax*dt/1000 sec

//number of colors
var num_gemtypes = 4;
var max_gemtypes = 10;

//check the state, used for the falling effect
var is_reducing = false;
var is_falling = false;

//store the grids at each time step during 'falling' and display them as a sequence
let Grids = [] ;
let soundbuffer = []; //used for sync screen and sound
var idx = 0;
var canSound = true;

//time limit used for mode 2 (with a scale of second)
var time_limit = 12000;

var SizeW = 400*recreateCanvas_factor, SizeH = 500*recreateCanvas_factor;
var offsetW = (SizeW-q*w)/2+q, offsetH = (SizeH-q*h)/2;


//load images and sounds
let imgs = [];
let sounds = [];

//
var characters = [];
var hat_idx = 0;
var character_idx = 0;




function setup() {
	//createCanvas(SizeW, SizeH, P2D);
	createCanvas(windowWidth, windowHeight);
	textSize(20);
	dt = 300;
	frameRate(60);
    textColor = color(34, 230, 190)
    backgroundColor = color(155,155,155);
  
    imgs[0] = loadImage("./assets/hat1.png"); imgs[1] = loadImage("./assets/hat2.png");imgs[2] = loadImage("./assets/hat3.png");
    sounds[0] = loadSound("./assets/1.mp3");sounds[1] = loadSound("./assets/2.mp3");sounds[2] =     loadSound("./assets/3.mp3");sounds[3] = loadSound("./assets/4.mp3");sounds[4] = loadSound("./assets/5.mp3");
    characters[0] = loadImage("./assets/red.png"); characters[1] = loadImage("./assets/blue.png"); characters[2] = loadImage("./assets/yellow.png");
  
  	background_img = loadImage("./assets/bg.jpg");

}
function touchStarted () {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
document.ontouchmove = function(event) {
    event.preventDefault();
};

function initialize() {
	level = 1;
	nbLines = 0;
	currentTime = millis();
	score = new Score();
	grid = new Grid();
	pieces = new Pieces();
	piece = new Piece(-1);
	nextPiece = new Piece(-1);
}

//Small board createCanvas/frozen at beginning/enable rotation/falling pieces
function initialize2() {
	header_num = 5;
	w = 6;
	h = 6 + header_num;
	num_gemtypes = 3;
	dt = 200;
	frozenAtBeginning = true;
	frozen = true;
	frozenCountMax = 1000;
	preview = true;
	offsetW = (SizeW-q*w)/2+1.5*q, offsetH = (SizeH-q*h)/2;

}

function draw() {
	
	if (mode == 2) {
		time_limit -= 1 / 60;
		if (time_limit <= 0) gameOver = true;
	}
	if (millis() - time > coolDownTime) {
		time = millis();
		canPress = true;
	}

	background(backgroundColor);
    image(background_img,0,0);

	if (is_falling) {
        Grids[idx].drawGrid();
		if(canSound){
          playSound(soundbuffer[idx]);
          canSound = false;
        }
		var now = millis();
		var t = dt/8;
		if (now - currentTime > t) {
			currentTime = now;
            canSound = true;
			if (++idx >= Grids.length) {
				is_falling = false;
				goToNextPiece();
				if (frozenAtBeginning) frozen = true;
				idx = 0;
				Grids = [];
				soundbuffer = [];
			}
		}
		//piece.display(false);
		score.display();
		drawCharacter();
		return;

	}


	if (grid != null) {
		grid.drawGrid();
		let now = millis();
		if (gameOn) {
			if (now - currentTime > dt) {
				currentTime = now;
				if (frozen && frozenCount < frozenCountMax)
					frozenCount++;
				else {
					frozenCount = 0;
					frozen = false;
					piece.oneStepDown();
				}



			}
		}
		piece.display(false);
		score.display();
		drawCharacter();

	}
	if (gameOver) {
		noStroke();
		fill(255, 60);
		rect(110, 195, 240, 2 * txtSize, 3);
		fill(textColor);
		text("Game Over", 120, 220);
	}
	if (!gameOn) {
		noStroke();
		fill(255, 60);
		rect(10, 150, 590, 10 * txtSize, 3);
		fill(textColor);
		text("Click to start playing", 20, 180);
		text("Tap on both side to move the tetris", 20, 180 + 2 * txtSize);
		text("Tap on the grid to rotate", 20, 180 + 4 * txtSize);
		text("Swipe down to drop it", 20, 180 + 6 * txtSize);

	}
	if (grid != null && grid.checkEnd()) {
		gameOver = true;
		gameOn = false;
	}
}

function goToNextPiece() {
	//prvarln("-- - nextPiece - - --");
	piece = new Piece(nextPiece.kind);
	piece.copy_value(nextPiece);
	nextPiece = new Piece(-1);
	//r = 0;
}

function goToNextLevel() {
	score.addLevel();
	level = 1 + int(nbLines / 10);
	dt *= .8;
	//soundLevelUp();
}

function mouseReleased() {
	if (!gameOn) {
        initialize2();
		initialize();
		gameOver = false;
		gameOn = true;
	}

	if (canPress && !isDragging) {
		if (grid.inside(mouseX, mouseY)) piece.inputKey(UP_ARROW);
		else if (grid.rightside(mouseX, mouseY)) {
			piece.inputKey(RIGHT_ARROW);
		} else if (grid.leftside(mouseX, mouseY)) {
			piece.inputKey(LEFT_ARROW);
		}
		canPress = false;
	}
	if (isDragging && mouseY > my) {
		piece.inputKey(SHIFT);
	}
	isDragging = false;
}
function mouseDragged() {
	if (!isDragging) {
		mx = mouseX;
		my = mouseY;
		isDragging = true;
	}

}

function keyPressed() {
	if (is_falling) return;
	if (gameOn) {
		switch (keyCode) {
			case LEFT_ARROW:
			case RIGHT_ARROW:
			case DOWN_ARROW:
			case UP_ARROW:
			case SHIFT:
				piece.inputKey(keyCode);
				break;
		}
	}  else if (keyCode == 77) { // "m"
		preview_outline = !preview_outline;
	} 
	
}


class Score {
	constructor(){
      this.points = 0;
    }

	addLinePoints(nb) {
		if (mode == 2) time_limit += 5;
		if (nb == 4) {
			this.points += level * 10 * 20;
		} else {
			this.points += level * nb * 20;
		}
	}

	addPiecePoints() {
		this.points += level * 5;
	}

	addLevelPoints() {
		this.points += level * 100;
	}

	display() {
		push();
		translate(10, 60);

		//score
		fill(textColor);
		text("score: ", 0, 0);
		fill(230, 230, 12);
		text("" + this.formatPoint(this.points), 0, txtSize);
		fill(textColor);

		translate(0, 60);
		text("next: ", 0, 0);
		translate(q*1.2, 1.3 * q);
		nextPiece.display(true);
		pop();


	}

	formatPoint(p) {
		var txt = "";
		var qq = int(p / 1000000);
		if (qq > 0) {
			txt += qq + ".";
			p -= qq * 1000000;
		}

		qq = int(p / 1000);
		if (txt != "") {
			if (qq == 0) {
				txt += "000";
			} else if (qq < 10) {
				txt += "00";
			} else if (qq < 100) {
				txt += "0";
			}
		}
		if (qq > 0) {
			txt += qq;
			p -= qq * 1000;
		}
		if (txt != "") {
			txt += ",";
		}

		if (txt != "") {
			if (p == 0) {
				txt += "000";
			} else if (p < 10) {
				txt += "00" + p;
			} else if (p < 100) {
				txt += "0" + p;
			} else {
				txt += p;
			}
		} else {
			txt += p;
		}
		return txt;
	}
}

function playSound(code) {
	if(code==0) return;
	if(combo_idx<combo){
		sounds[combo_idx++].play();
	}
	if(combo_idx>=combo){
		combo_idx = 0;
		combo = 0;
	}
	
 	var tmp = code;
 	var count = 0;

  while(tmp!=0){
		if(tmp%2!=0){
			hat_idx = count;
		}
		tmp = tmp>>1;count++;
	}
	character_idx = (character_idx+1)%3;

}

function drawCharacter(){
	var character = characters[character_idx];
	image(character,(offsetW-character.width)/2,SizeH-300,180,180);
	
	if(hat_idx==0)
		image(imgs[hat_idx],(offsetW-character.width)/2,SizeH-300-130,180,180);
	else
		image(imgs[hat_idx],(offsetW-character.width)/2,SizeH-300-110,180,180);

}
function touchMoved() {
  return false;
}

function drawImg(cid, w, h,sizeW, sizeH, alpha){
	image(imgs[cid],w,h,sizeW,sizeH);
}