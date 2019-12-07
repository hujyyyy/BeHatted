var w = 8;
var h = 8 + 5;
var header_num = 5;
var mode = 2;

var time = 0;
var coolDownTime = 500;
let canPress = true, isDragging = false;
var mx = 0, my = 0;

var q = 35; //blocks width and height
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

var SizeW = 400, SizeH = 500;
var offsetW, offsetH;


//load images and sounds
let imgs = [];
let sounds = [];

//
var characters = [];
let happy_faces = [];
let sad_faces = [];
var hat_idx = 0;
var character_idx = 0;
var characters_size;
//var character;

var touchMoved_factor = 1/1.8;
var tapx,tapy;
let horizontal_move = false;

//fix ios sound problem
var first_touch = true;
var allAudio = [];
var testsound,sound1,sound2,sound0;

function preload()
{
	soundFormats('mp3');
	sound0 = loadSound("./assets/1.mp3");
	sound1 = loadSound("./assets/2.mp3");
	sound2 = loadSound("./assets/3.mp3");
	// sounds[0] = loadSound("./assets/1.mp3");
	// sounds[1] = loadSound("./assets/2.mp3");
	// sounds[2] = loadSound("./assets/3.mp3");
	// sounds[3] = loadSound("./assets/4.mp3");
	// sounds[4] = loadSound("./assets/5.mp3");

}


function unlock_sound(){
	// Play all audio files on the first tap and stop them immediately.
	sound0.play();sound0.pause();
	sound1.play();sound1.pause();
	sound2.play();sound2.pause();
	//testsound.play();

}

function setup() {
	//sounds[0].setVolume(1);
	//sounds[0].play();
	//createCanvas(SizeW, SizeH, P2D);
	//createCanvas(displayWidth, displayHeight);
	if(displayWidth>1125||displayHeight>2436){
		SizeW = 600; SizeH = 900; 
	}else{
		//compansate for the space taken by browser
		SizeW = displayWidth; SizeH = displayHeight*0.95;
	}

		
	createCanvas(SizeW,SizeH);
	dt = 300;
	frameRate(60);
    textColor = color(34, 230, 190)
    backgroundColor = color(155,155,155);
  
    imgs[0] = loadImage("./assets/hat1.png"); imgs[1] = loadImage("./assets/hat2.png");imgs[2] = loadImage("./assets/hat3.png");
    characters[0] = loadImage("./assets/red.png"); characters[1] = loadImage("./assets/blue.png"); characters[2] = loadImage("./assets/yellow.png");
    happy_faces[0] = loadImage("./assets/red_happy.png"); happy_faces[1] = loadImage("./assets/blue_happy.png"); happy_faces[2] = loadImage("./assets/yellow_happy.png");
  	sad_faces[0] = loadImage("./assets/red_sad.png"); sad_faces[1] = loadImage("./assets/blue_sad.png"); sad_faces[2] = loadImage("./assets/yellow_sad.png");


  	background_img = loadImage("./assets/bg3.jpg");
}

function initialize() {

	level = 1;
	nbLines = 0;
	currentTime = millis();
	score = new Score();
	grid = new Grid();
	pieces = new Pieces();
	piece = new Piece(-1);
	nextPiece = new Piece(-1);
	character = new Character();
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

	q = min(SizeW,SizeH)/10;
	textSize(q/2);
	txtSize = q;
	characters_size = 2.5*q;
	offsetW = (SizeW-q*w)/2+q*1.2, offsetH = q*1.5;
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
    image(background_img,0,0,SizeW,SizeH);

	if (is_falling) {
        Grids[idx].drawGrid();
		if(canSound){
          playSound(soundbuffer[idx]);
          canSound = false;
        }
		var now = millis();
		var t = dt/8;
		if(soundbuffer[idx]!=0)t*=4;
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
		character.draw();
		//drawCharacter();
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
					//piece.oneStepDown();
				}



			}
		}
		piece.display(false);
		score.display();
		character.draw();
		//drawCharacter();

	}
	if (gameOver) {
		textSize(SizeW*0.8/12);
		stroke(55);strokeWeight(6);
		fill(55, 190);
		rect(SizeW*0.1, SizeH*0.1, SizeW*0.8, txtSize*8, 3);
		fill(225);
		var xoffset = SizeW*0.2;
		var yoffset = SizeH*0.2;
		text("Your Final Score: ", xoffset*1.1, yoffset);
		fill(230, 230, 12);
		textSize(SizeW*0.8/10);
		text(score.pointsAsStr(), xoffset*2, yoffset+txtSize);
		fill(225);
		textSize(SizeW*0.8/12);
		text("Click/tap to Restart", xoffset, yoffset+3*txtSize);
	}
	if (!gameOn&&!gameOver) {
		//noStroke();
		textSize(SizeW*0.8/16);
		stroke(55);strokeWeight(4);
		fill(55, 90);
		rect(SizeW*0.1, SizeH*0.1, SizeW*0.8, txtSize*13, 3);
		fill(225);
		var xoffset = SizeW*0.12;
		var yoffset = SizeH*0.17;
		text("Click/tap to start playing", xoffset, yoffset);
		text("PC: ARROW Keys to control", xoffset, yoffset + 2 * txtSize);
		text("      SHIFT or DOWN to drop", xoffset, yoffset + 4 * txtSize);
		text("Mobile: Swipe left/right to move", xoffset, yoffset + 6 * txtSize);
		text("             Tap to Rotate", xoffset, yoffset + 8 * txtSize);
		text("             Swipe down to drop", xoffset, yoffset + 10 * txtSize);

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

function touchStarted(){
	if(first_touch){unlock_sound();first_touch = false;}
	if(gameOn){
		tapx = mouseX;
		tapy = mouseY;
	}

}

function touchEnded(){
	if (!gameOn) {
        initialize2();
		initialize();
		gameOver = false;
		gameOn = true;
		return;
	}

	if (!horizontal_move&&isDragging && mouseY-my > 2) {
		piece.inputKey(SHIFT);
	}else{
		if(mouseX==tapx&&mouseY==tapy) piece.inputKey(UP_ARROW);
	}


	isDragging = false;
	horizontal_move = false;

	return false;
}

function touchMoved(){
	if (!isDragging) {
		mx = mouseX;
		my = mouseY;
		isDragging = true;
	}
	if(mouseX-mx>q*touchMoved_factor) {piece.inputKey(RIGHT_ARROW); mx = mouseX; horizontal_move = true;}
	if(mouseX-mx<-q*touchMoved_factor) {piece.inputKey(LEFT_ARROW);	mx = mouseX; horizontal_move = true;}
	return false;
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
		//this.points += level * 5;
	}

	addHatPoints(){
		this.points +=50;
	}

	addLevelPoints() {
		this.points += level * 100;
	}

	pointsAsStr(){
		return this.formatPoint(this.points);
	}

	display() {
		textSize(q/2);
		stroke(50);
		push();
		translate(10, q);

		//score
		fill(textColor);
		text("score: ", 0, 0);
		fill(230, 230, 12);
		text("" + this.formatPoint(this.points), 0, txtSize/2);
		fill(textColor);

		translate(0, txtSize*1.5);
		text("next: ", 0, 0);
		translate(q, 1.3 * q);
		scale(0.7);
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

class Character{

	constructor(){
		//gem id
		this.cid = 0;
		//face id(0-normal,1-sad,2-happy)
		this.fid = 1;
		this.hat_id = 1;

		this.hatdroptime = 10;
		this.hatdrop = this.hatdroptime;

		this.faceAnimTime = 13;
		this.faceAnim = 0;
		this.happyAnim = [0,0,0,-q/5,-q/5*2,-q/5*3,-q/5*4,-q/5*3,-q/5*2,-q/5,0,0,0];
		this.sadAnim = [0,0,0,-q/7,q/7,-q/8,q/8,-q/9,0,q/9,0,0,0];
	}

	draw(){
		
		var face;
		switch(this.fid){
			case 0:
				face = characters[this.cid];break;
			case 1:
				face = sad_faces[this.cid];break;
			case 2:
				face = happy_faces[this.cid];break;
			default:
				break;

		}

		push();
		//translate(0,-q*1.5);
		if(this.hatdrop==0&&this.faceAnim<this.faceAnimTime){
			if(this.fid == 1) translate(this.sadAnim[this.faceAnim++],0);
			if(this.fid == 2) translate(0,this.happyAnim[this.faceAnim++]);
		}
		image(face,(offsetW-characters_size)/2,SizeH/2+characters_size*1.2+q,characters_size,characters_size);
		

		for(let i=0;i<this.hatdrop;++i) translate(0,-q/5);

		if(this.hatdrop>0)this.hatdrop--;
		else {
			if(this.hat_id==this.cid) this.fid = 2;
			else this.fid = 1;
		}

		if(this.hat_id==0)
			image(imgs[this.hat_id],(offsetW-characters_size)/2,SizeH/2+characters_size*1.2/3+q,characters_size,characters_size);
		else if(this.hat_id>0)
			image(imgs[this.hat_id],(offsetW-characters_size)/2,SizeH/2+characters_size*1.2/2+q,characters_size,characters_size);
		pop();

		if(this.faceAnim==this.faceAnimTime) this.next();

	}

	next(){
		if(this.cid==this.hat_id){
			this.cid = (this.cid + 1+int(random(2)))%3;
			score.addHatPoints();
		}

		else{
			this.hatdrop = this.hatdroptime;
			this.faceAnim = this.faceAnimTime;
		}

		this.hat_id = -1;
		this.fid = 0;
	}

	new_hat(hat_idx){
		this.hat_id = hat_idx;
		this.hatdrop = this.hatdroptime; 
		this.faceAnim = 0;
		//this.fid = this.cid==this.hat_id?2:1;
	}


}


function playsound_idx(id){
	switch(id){
	case 0:
		sound0.play();break;
	case 1:
		sound1.play();break;
	default:
		sound2.play();break;
	}

}

function playSound(code) {
	if(code==0) return;
	if(combo_idx<combo){
		playsound_idx(combo_idx++);
		//sounds[combo_idx++].play();
		//testsound.play();
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
			if(character.cid==hat_idx) break;
		}
		tmp = tmp>>1;count++;
	}

	character.new_hat(hat_idx);

}

function drawCharacter(){
	var character = characters[character_idx];
	image(character,(offsetW-characters_size)/2,SizeH/2+characters_size*1.2,characters_size,characters_size);
	
	if(hat_idx==0)
		image(imgs[hat_idx],(offsetW-characters_size)/2,SizeH/2+characters_size*1.2/3,characters_size,characters_size);
	else
		image(imgs[hat_idx],(offsetW-characters_size)/2,SizeH/2+characters_size*1.2/2,characters_size,characters_size);

}

function drawImg(cid, w, h,sizeW, sizeH, alpha){
	image(imgs[cid],w,h,sizeW,sizeH);
}