let combo = 0;
let combo_idx = 0;

class Grid {

  constructor() {
    this.cells = [];
    this.cells_visited = [];

    for (let i = 0; i < w; i ++) {
      for (let j = 0; j < h; j ++) {
        if(j==0){this.cells[i] = [];this.cells_visited[i]=[];}
        this.cells[i][j] = 0;
		this.cells_visited[i][j] = -1;
      }
    }
  }

  copy(){
	let g = new Grid();
	for (let i = 0; i < w; i ++) {
      	for (let j = 0; j < h; j ++) {
        	g.cells[i][j] = this.cells[i][j];
      	}
    }
	return g;
  }
	
  isFree(x, y) {
    if (x > -1 && x < w && y > -1 && y < h) {
      return this.cells[x][y] == 0;
    } else if (y < 0) {
      return true;
    }
    return false;
  }

  pieceFits() {
    let x = piece.x;
    let y = piece.y;
    let pos = piece.pos;
    let pieceOneStepDownOk = true;
    for (let i = 0; i < 4; i ++) {
      let tmpx = pos[piece.r][i][0]+x;
      let tmpy = pos[piece.r][i][1]+y;
      if (tmpy >= h || !this.isFree(tmpx, tmpy)) {
        pieceOneStepDownOk = false;
        break;
      }
    }
    return pieceOneStepDownOk;
  }

  checkEnd(){
		for(let i =0;i<w;++i){
			if(this.cells[i][header_num-1]!=0) return true;		
		}
		return false;
	}

  addPieceToGrid() {
    let x = piece.x;
    let y = piece.y;
    //println("addPieceToGrid x: "+x+" y: "+y);
    let pos = piece.pos;
    for (let i = 0; i < 4; i ++) {
      if(pos[piece.r][i][1]+y >= 0){
        this.cells[pos[piece.r][i][0]+x][pos[piece.r][i][1]+y] = piece.gems[i]+1;
      }else{
        gameOn = false;
        gameOver = true;

        return;
      }
    }
    score.addPiecePoints();



    this.checkFall();
    while(this.checkLinesReduce()){
            combo++;
            this.checkFall();
     }

    if(!is_falling){
        goToNextPiece();
        this.drawGrid();
        if(frozenAtBeginning)frozen = true;
    }
  }

	cells_visited_clear(){
    for (let i = 0; i < w; i ++) {
      for (let j = 0; j < h; j ++) {
			this.cells_visited[i][j] = -1;
      }
    }
	
  }
	

  checkLinesReduce(){
		let nb = 0;
		let blocks_to_delete = [];//new int[20][2];//we assume no more than 20 blocks will be eliminated at the same time
		let nbd = 0; //num of blocks to be deleted
		
		let count = 0;
		let color_reduced = 0;//000 - 111 binary coded, 000 means no reduce, 111 means all three colors reduced
		//check horizontal
		for (let j =0;j<h;++j){
			for (let i=0;i<w-2;++i){
				if(this.cells[i][j]!=0&&(this.cells[i][j]==this.cells[i+1][j]&&this.cells[i][j]==this.cells[i+2][j])){
					let gem_type = this.cells[i][j]; color_reduced |= pow(2,gem_type-1);
                    blocks_to_delete.push([i,j]);blocks_to_delete.push([i+1,j]);blocks_to_delete.push([i+2,j]);
					// blocks_to_delete[nbd][0] = i;blocks_to_delete[nbd++][1] = j;
					// blocks_to_delete[nbd][0] = i+1;blocks_to_delete[nbd++][1] = j;
					// blocks_to_delete[nbd][0] = i+2;blocks_to_delete[nbd++][1] = j;
                    nbd+=3;
					i+=3;
					while(i<w&&this.cells[i][j]==gem_type){
						//blocks_to_delete[nbd][0] = i;blocks_to_delete[nbd++][1] = j;
                        blocks_to_delete.push([i,j]);nbd++;
						++i;
					}
				}
			}
		}
		
		for (let i =0;i<w;++i){
			for (let j=0;j<h-2;++j){
				if(this.cells[i][j]!=0&&(this.cells[i][j]==this.cells[i][j+1]&&this.cells[i][j]==this.cells[i][j+2])){
					let gem_type = this.cells[i][j]; color_reduced |= pow(2,gem_type-1);
                    blocks_to_delete.push([i,j]);blocks_to_delete.push([i,j+1]);blocks_to_delete.push([i,j+2]);
					// blocks_to_delete[nbd][0] = i;blocks_to_delete[nbd++][1] = j;
					// blocks_to_delete[nbd][0] = i;blocks_to_delete[nbd++][1] = j+1;
					// blocks_to_delete[nbd][0] = i;blocks_to_delete[nbd++][1] = j+2;
                    nbd+=3;
					j+=3;
					while(j<h&&this.cells[i][j]==gem_type){
						//blocks_to_delete[nbd][0] = i;blocks_to_delete[nbd++][1] = j;
                        blocks_to_delete.push([i,j]);nbd++;
						++j;
					}
				}
			}
		}
		if(nbd<=0) return false;
		//print("reduce blocks nums: "+str(nbd));
		let g = this.copy();
		for(let i=0;i<nbd;++i){
			this.cells[blocks_to_delete[i][0]][blocks_to_delete[i][1]] = 0;
		}
		let g_black = this.copy();
		Grids.push(g_black);Grids.push(g);Grids.push(g_black);
		soundbuffer.push(0);soundbuffer.push(color_reduced);soundbuffer.push(0);
		for(let i=0;i<nbd;++i){
			this.cells[blocks_to_delete[i][0]][blocks_to_delete[i][1]] = 0;
		}
		Grids.push(this.copy());soundbuffer.push(0);
		is_falling = true;
		score.addLinePoints(int(nbd/3));
		return true;
	}

	checkFall(){
	  for (let k = h-2; k > 0; k--) {
		let count = 0;
        for (let i = 0; i < w; i++) {
					//if(cells[i][k]==0) {count++;continue}
					if(this.cells[i][k]!=0&&this.cells[i][k+1]==0){
						//if down direction empty, make it fall
						let j = k;
						while(j<h-1){
							if(this.cells[i][j+1]==0){
								this.cells[i][j+1] = this.cells[i][j];
								this.cells[i][j] = 0;
								j++;
								Grids.push(this.copy());soundbuffer.push(0);
								is_falling = true;
							}else{break;}
						}
					}
						
			}
      }
			
	
	}
  
  setToBottom() {
	frozenCount = 0;
    let originalY = piece.y;
    let j = 0;
    for (j = 0; j < h; j ++) {
      if (!this.pieceFits()) {
        break;
      } else {
        piece.y++;
      }
    }
    piece.y--;
    this.addPieceToGrid();
  }
  
  drawGrid() {
    stroke(50);strokeWeight(5);
    push();
    translate(offsetW, offsetH);
    for (let i = 0; i <= w; i ++) {
			if(i==0||i==w)
				line(i*q, 0, i*q, h*q);
      else line(i*q, header_num*q, i*q, h*q);
    }
    for (let j = header_num; j <= h; j ++) {
      line(0, j*q, w*q, j*q);
    }

    stroke(80);
    for (let i = 0; i < w; i ++) {
      for (let j = 0; j < h; j ++) {
        if (this.cells[i][j] != 0) {
          // fill(cells[i][j]);
          // rect(i*q, j*q, q, q);
		  drawImg(this.cells[i][j]-1,i*q, j*q, q, q,255);
        }
      }
    }
    pop();
  }

  inside(x, y){
		return x>=offsetW && x <= offsetW + q*w && y>=offsetH && y<= offsetH + q*h;
	}
  leftside(x, y){
		return x<offsetW;
	}
  rightside(x, y){
		return x>offsetW + q*w;
	}
	
}

class Pos{

	constructor(the_x, the_y){
		this.x = the_x;
		this.y = the_y;
	}
	check_valid(){
		return(x>=0&&x<w&&y>=0&&y<h);
	}

}