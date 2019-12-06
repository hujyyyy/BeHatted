class Piece {

  constructor(k) {
    this.x = int(w/2);
    this.y = 0;
    this.gems = [];
    this.cols = [];
    this.kind = k < 0 ? int(random(0, 7)) : k;
    //this.c = colors[kind];
    this.r = 0;
    // [rotation][block nb][x or y]
    this.pos = pieces.pos[this.kind];
		let gem_check = [0,0,0,0,0,0,0,0,0,0,0];
		for(let i=0;i<4;++i){
			let gem_type = int(random(num_gemtypes));
			
			while(gem_check[gem_type]>=2) {gem_type = int(random(num_gemtypes));}
			gem_check[gem_type] += 1;
			this.gems[i] = gem_type;
			//cols[i] = colors[gem_type];
		}

  }
  copy_value(p){
	for (let i=0;i<4;i++){
		this.gems[i] = p.gems[i];
		//cols[i] = p.cols[i]; 
	 }
	
	}

  display(still) {
    stroke(250);
	if(preview)this.display_pred(still);	
    //fill(c);
    push();
    if (!still) {
      translate(offsetW, offsetH);
      translate(this.x*q, this.y*q);
    }
    let rot = still ? 0 : this.r;
    for (let i = 0; i < 4; i++) {
			// fill(colors[gems[i]]);
			// rect(pos[rot][i][0] * q, pos[rot][i][1] * q, q, q);
			drawImg(this.gems[i],this.pos[rot][i][0] * q, this.pos[rot][i][1] * q, q, q,255);
    }		
    pop();		
  }

	display_pred(still){
		let rot = still ? 0 : this.r;
		push();
		translate(offsetW, offsetH);
		if(!still){
			let cells_tmp = [];
			for (let i=0;i<w;i++) {
              cells_tmp.push([]);
              for(let j = 0;j<h;j++) {if(j==0)cells_tmp[i].push([]);cells_tmp[i][j] = 0;}
            }
            
			for (let i = 0; i < 4; i ++){
				//print(pos[rot][i][1]+y+1);
				cells_tmp[this.pos[rot][i][0]+this.x][this.pos[rot][i][1]+this.y+1] =  this.gems[i]+1;
			}
			for(let i=0;i<w;++i){
				for(let j=h-1;j>=0;j--){
					if(cells_tmp[i][j]>0){//>0 if use idx, <0 if use color directly
						let h0 = h-1;
						while(grid.cells[i][h0]!=0||cells_tmp[i][h0]<0) {
							h0--;
							if(h0<0) break;
						}
						if(h0<0) continue;
						//fill(cells_tmp[i][j]);
						//rect(i * q,h0 * q, q, q);
						if(preview_outline) drawImg(cells_tmp[i][j]-1,i * q,h0 * q, q, q,255);
						fill(255,50);
						rect(i * q, h0 * q, q, q);
						cells_tmp[i][h0] = -1;//-1 if use idx, 1 fi use color directly
					}
				}
			}
		}
		pop();
	
	
	}

  // returns true if the piece can go one step down
  oneStepDown() {
    this.y += 1;
    if(!grid.pieceFits()){
      piece.y -= 1;
      grid.addPieceToGrid();
    }
  }

  // try to go one step left
  oneStepLeft() {
    this.x -= 1;
    if (!grid.tryOneStepLeft()) {
      this.x+=1;
    }
  }

  // try to go one step right
  oneStepRight() {
    this.x += 1;
    if (!grid.tryOneStepRight()) {
      this.x -= 1;
    }
  }

  goToBottom() {
    grid.setToBottom();
  }

  inputKey(k) {
    switch(k) {
    case LEFT_ARROW:
        this.x --;
      if(grid.pieceFits()){
        //soundLeftRight();
      }else {
         this.x++; 
      }
      break;
    case RIGHT_ARROW:
      this.x ++;
      if(grid.pieceFits()){
        //soundLeftRight();
      }else{
         this.x--; 
      }
      break;
    case DOWN_ARROW:
      this.goToBottom();
      break;
    case UP_ARROW:
      this.r = (this.r+1)%4;
      if(!grid.pieceFits()){
         this.r = this.r-1 < 0 ? 3 : this.r-1; 
         //soundRotationFail();
      }else{
        //soundRotation();
      }
      break;
    case SHIFT:
      this.goToBottom();
      break;
    }
  }
}



class Pieces {
  constructor() {
    this.pos = [];
    for(let i=0;i<7;++i){
      this.pos.push([]);
      for(let j=0;j<4;++j){
        this.pos[i].push([]);
        for(let x=0;x<4;++x){
          this.pos[i][j][x] = [0,0];
        }
      }
    }
        
    
    ////   @   ////
    //// @ @ @ ////
    this.pos[0][0][0][0] = -1;//piece 0, rotation 0, point nb 0, x
    this.pos[0][0][0][1] = 0;// piece 0, rotation 0, point nb 0, y
    this.pos[0][0][1][0] = 0;
    this.pos[0][0][1][1] = 0;
    this.pos[0][0][2][0] = 1;
    this.pos[0][0][2][1] = 0;
    this.pos[0][0][3][0] = 0;
    this.pos[0][0][3][1] = 1;
    
    this.pos[0][1][0][0] = 0;
    this.pos[0][1][0][1] = 1;
    this.pos[0][1][1][0] = 0;
    this.pos[0][1][1][1] = 0;
    this.pos[0][1][2][0] = 0;
    this.pos[0][1][2][1] = -1;
    this.pos[0][1][3][0] = 1;
    this.pos[0][1][3][1] = 0;

    this.pos[0][2][0][0] = 1;
    this.pos[0][2][0][1] = 0;
    this.pos[0][2][1][0] = 0;
    this.pos[0][2][1][1] = 0;
    this.pos[0][2][2][0] = -1;
    this.pos[0][2][2][1] = 0;
    this.pos[0][2][3][0] = 0;
    this.pos[0][2][3][1] = -1;

    this.pos[0][3][0][0] = 0;
    this.pos[0][3][0][1] = -1;
    this.pos[0][3][1][0] = 0;
    this.pos[0][3][1][1] = 0;
    this.pos[0][3][2][0] = 0;
    this.pos[0][3][2][1] = 1;
    this.pos[0][3][3][0] = -1;
    this.pos[0][3][3][1] = 0;

    //// @ @   ////
    ////   @ @ ////
    this.pos[1][0][0][0] =-1;//piece 1, rotation 0, point nb 0, x
    this.pos[1][0][0][1] =  1;// piece 1, rotation 0, point nb 0, y
    this.pos[1][0][1][0] = 0;
    this.pos[1][0][1][1] =  1;
    this.pos[1][0][2][0] = 0;
    this.pos[1][0][2][1] =  0;
    this.pos[1][0][3][0] =  1;
    this.pos[1][0][3][1] = 0;

    this.pos[1][1][0][0] =  0;
    this.pos[1][1][0][1] =  1;
    this.pos[1][1][1][0] =  0;
    this.pos[1][1][1][1] =  0;
    this.pos[1][1][2][0] = -1;
    this.pos[1][1][2][1] =  0;
    this.pos[1][1][3][0] =  -1;
    this.pos[1][1][3][1] = -1;
		
		this.pos[1][2][0][0] =1;
    this.pos[1][2][0][1] =  0;
    this.pos[1][2][1][0] = 0;
    this.pos[1][2][1][1] =  0;
    this.pos[1][2][2][0] = 0;
    this.pos[1][2][2][1] =  1;
    this.pos[1][2][3][0] =  -1;
    this.pos[1][2][3][1] = 1;
		
		this.pos[1][3][0][0] =  -1;
    this.pos[1][3][0][1] =  -1;
    this.pos[1][3][1][0] =  -1;
    this.pos[1][3][1][1] =  0;
    this.pos[1][3][2][0] = 0;
    this.pos[1][3][2][1] =  0;
    this.pos[1][3][3][0] =  0;
    this.pos[1][3][3][1] = 1;
    
    ////   @ @ ////
    //// @ @   ////
    this.pos[2][0][0][0] = 0;//piece 2, rotation 0 and 2, point nb 0, x
    this.pos[2][0][0][1] =  1;//piece 2, rotation 0 and 2, point nb 0, y
    this.pos[2][0][1][0] = 1;
    this.pos[2][0][1][1] =  1;
    this.pos[2][0][2][0] =  -1;
    this.pos[2][0][2][1] = 0;
    this.pos[2][0][3][0] = 0;
    this.pos[2][0][3][1] =  0;

    this.pos[2][1][0][0] = 0;
    this.pos[2][1][0][1] =  0;
    this.pos[2][1][1][0] =  0;
    this.pos[2][1][1][1] =  1;
    this.pos[2][1][2][0] = 1;
    this.pos[2][1][2][1] =  -1;
    this.pos[2][1][3][0] =  1;
    this.pos[2][1][3][1] =  0;
    
	  this.pos[2][2][0][0] = 0;
    this.pos[2][2][0][1] =  0;
    this.pos[2][2][1][0] = -1;
    this.pos[2][2][1][1] =  0;
    this.pos[2][2][2][0] =  1;
    this.pos[2][2][2][1] = 1;
    this.pos[2][2][3][0] = 0;
    this.pos[2][2][3][1] =  1;

    this.pos[2][3][0][0] = 1;
    this.pos[2][3][0][1] =  0;
    this.pos[2][3][1][0] =  1;
    this.pos[2][3][1][1] =  -1;
    this.pos[2][3][2][0] = 0;
    this.pos[2][3][2][1] =  1;
    this.pos[2][3][3][0] =  0;
    this.pos[2][3][3][1] =  0;
    
    ////// @ //////
    ////// @ //////
    ////// @ //////
    ////// @ //////
    this.pos[3][0][0][0] =  0;//piece 3, rotation 0 and 2, point nb 0, x
    this.pos[3][0][0][1] =  -1;//piece 3, rotation 0 and 2, point nb 0, y
    this.pos[3][0][1][0] =  0;
    this.pos[3][0][1][1] =0;
    this.pos[3][0][2][0] =  0;
    this.pos[3][0][2][1] =  1;
    this.pos[3][0][3][0] =  0;
    this.pos[3][0][3][1] =  2;

    this.pos[3][1][0][0] = -1;
    this.pos[3][1][0][1] = 0;
    this.pos[3][1][1][0] =  0;
    this.pos[3][1][1][1] =  0;
    this.pos[3][1][2][0] =  1;
    this.pos[3][1][2][1] =  0;
    this.pos[3][1][3][0] =  2;
    this.pos[3][1][3][1] =  0;
		  
		this.pos[3][2][0][0] = 0;
    this.pos[3][2][0][1] = 2;
    this.pos[3][2][1][0] =  0;
    this.pos[3][2][1][1] =  1;
    this.pos[3][2][2][0] =  0;
    this.pos[3][2][2][1] =  0;
    this.pos[3][2][3][0] =  0;
    this.pos[3][2][3][1] =  -1;
		
		 this.pos[3][3][0][0] = 2;
    this.pos[3][3][0][1] = 0;
    this.pos[3][3][1][0] =  1;
    this.pos[3][3][1][1] =  0;
    this.pos[3][3][2][0] =  0;
    this.pos[3][3][2][1] =  0;
    this.pos[3][3][3][0] =  -1;
    this.pos[3][3][3][1] =  0;
    
    //// @ @ ////
    //// @ @ ////
    //piece 4, all rotations are the same
    this.pos[4][0][0][0] = 0;
    this.pos[4][0][0][1] = 0;
    this.pos[4][0][1][0] = 1;
    this.pos[4][0][1][1] = 0;
    this.pos[4][0][2][0] = 0;
    this.pos[4][0][2][1] = 1;
    this.pos[4][0][3][0] = 1;
    this.pos[4][0][3][1] = 1;
		
		this.pos[4][1][0][0] =  0;
    this.pos[4][1][0][1] =  1;
    this.pos[4][1][1][0] =  0;
    this.pos[4][1][1][1] =  0;
    this.pos[4][1][2][0] =  1;
    this.pos[4][1][2][1] =  1;
    this.pos[4][1][3][0] =  1;
    this.pos[4][1][3][1] =  0;

		this.pos[4][2][0][0] =  1;
    this.pos[4][2][0][1] =  1;
    this.pos[4][2][1][0] =  0;
    this.pos[4][2][1][1] =  1;
    this.pos[4][2][2][0] =  1;
    this.pos[4][2][2][1] =  0;
    this.pos[4][2][3][0] =  0;
    this.pos[4][2][3][1] =  0;
		
		this.pos[4][3][0][0] =  1;
    this.pos[4][3][0][1] =  0;
    this.pos[4][3][1][0] =  1;
    this.pos[4][3][1][1] =  1;
    this.pos[4][3][2][0] =  0;
    this.pos[4][3][2][1] =  0;
    this.pos[4][3][3][0] =  0;
    this.pos[4][3][3][1] =  1;

    ///// @   ////
    ///// @   ////
    ///// @ @ ////
    this.pos[5][0][0][0] = 0;//piece 5, rotation 0, point nb 0, x
    this.pos[5][0][0][1] = 1;//piece 5, rotation 0, point nb 0, y
    this.pos[5][0][1][0] = 1;
    this.pos[5][0][1][1] = 1;
    this.pos[5][0][2][0] = 0;
    this.pos[5][0][2][1] = 0;
    this.pos[5][0][3][0] = 0;
    this.pos[5][0][3][1] = -1;

    this.pos[5][1][0][0] = 0;
    this.pos[5][1][0][1] = 1;
    this.pos[5][1][1][0] = 0;
    this.pos[5][1][1][1] = 0;
    this.pos[5][1][2][0] = -1;
    this.pos[5][1][2][1] = 1;
    this.pos[5][1][3][0] = -2;
    this.pos[5][1][3][1] = 1;

    this.pos[5][2][0][0] = 0;
    this.pos[5][2][0][1] = 0;
    this.pos[5][2][1][0] = -1;
    this.pos[5][2][1][1] = 0;
    this.pos[5][2][2][0] = 0;
    this.pos[5][2][2][1] = 1;
    this.pos[5][2][3][0] = 0;
    this.pos[5][2][3][1] = 2;

    this.pos[5][3][0][0] = 0;
    this.pos[5][3][0][1] = 0;
    this.pos[5][3][1][0] = 0;
    this.pos[5][3][1][1] = 1;
    this.pos[5][3][2][0] = 1;
    this.pos[5][3][2][1] = 0;
    this.pos[5][3][3][0] = 2;
    this.pos[5][3][3][1] = 0;
    
  
    //// @ @ ////
    //// @   ////
    //// @   ////
    this.pos[6][0][0][0] = -1;//piece 6, rotation 0, point nb 0, x
    this.pos[6][0][0][1] = 1;//piece 6, rotation 0, point nb 0, y
    this.pos[6][0][1][0] = 0;
    this.pos[6][0][1][1] = 1;
    this.pos[6][0][2][0] = 0;
    this.pos[6][0][2][1] = 0;
    this.pos[6][0][3][0] = 0;
    this.pos[6][0][3][1] = -1;

    this.pos[6][1][0][0] = 0;
    this.pos[6][1][0][1] = 1;
    this.pos[6][1][1][0] = 0;
    this.pos[6][1][1][1] = 0;
    this.pos[6][1][2][0] = -1;
    this.pos[6][1][2][1] = 0;
    this.pos[6][1][3][0] = -2;
    this.pos[6][1][3][1] = 0;

    this.pos[6][2][0][0] = 1;
    this.pos[6][2][0][1] = 0;
    this.pos[6][2][1][0] = 0;
    this.pos[6][2][1][1] = 0;
    this.pos[6][2][2][0] = 0;
    this.pos[6][2][2][1] = 1;
    this.pos[6][2][3][0] = 0;
    this.pos[6][2][3][1] = 2;

    this.pos[6][3][0][0] = 0;
    this.pos[6][3][0][1] = -1;
    this.pos[6][3][1][0] = 0;
    this.pos[6][3][1][1] = 0;
    this.pos[6][3][2][0] = 1;
    this.pos[6][3][2][1] = 0;
    this.pos[6][3][3][0] = 2;
    this.pos[6][3][3][1] = 0;
  }
}