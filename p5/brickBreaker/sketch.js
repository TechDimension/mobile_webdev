// improve collision detect
//
// calculate distance between two circle centers.
// if that answer is smaller than radiuss then collision is made.
//
function setup() {

  // put setup code here
  createCanvas(400,400);
  background(230);
  text('I love you Katie', 10, 60);
  fill(0, 102, 153, 51);
  ellipseMode(RADIUS);
  frameRate(60);
  

  paddle = new Paddle();
  ball = new Ball();

  board = new Board();
  board.setup();
  angleLine = new AngleLine();
}

function draw() {
  // put drawing code here
  fill(20);
  background(230);
  textSize(15);
  paddle.draw();
  paddle.move();
  board.draw();
  ball.draw();
  ball.setup();
  ball.move();


  board.checkHits();

  if (ball.start){
    angleLine.draw();

  }
  paddle.hit(ball);
  // also pass size of ball

  board.checkComplete();

}

function Board (){
   // levels
  this.lives = 3;
  this.level = 1;
  this.bricks = []; 
  this.powerUps = [];
  this.activePowers = [];
  this.activeTime = 0;
  this.draw = function(){
    fill(198);
    rect(0,0,400,400);
  }

  this.setup = function (){
    if (this.level === 0){
      this.bricks = [];
      return;
    }
    // level one
    for(let j =1 ; j < 4 ; j++){

      for(let i = 50; i < 350; i += 50){

        this.bricks.push( new Brick(i ,j * 20,this.level));
      }
    }
  }
  this.draw = function(){
    if (this.level === 0){
      textSize(30);
      text ("GAME OVER", 130, 200);
    }
    this.bricks.forEach(brick => {
      brick.draw();
    });
    let found = false;
    let index = 0;
    while(!found && index < this.powerUps.length){
      this.powerUps[index].drop();
      this.powerUps[index].draw();
      if (paddle.hitPower(this.powerUps[index])){
        found = true;
      };
      index ++;
    }
    this.activePowers.forEach(power => {
      if (power === "PADDLE_SIZE" && this.activeTime > 0){
        paddle.width = 120;
        this.activeTime -= 0.02;
      }
      else {
        paddle.width = 80;
      }
    })
  }

  this.checkComplete = function(){
    if (this.level >0){

    if(this.bricks.length === 0){
      this.level ++;
      this.lives ++;
      this.setup();
    }
    if (this.lives === 0){
      this.level = 0;
      this.setup();
      paddle.y = - 100;

    }
    textSize(20);
    text("Lives: "+this.lives,20,240);
    }
  }

  this.checkHits = function (){
    this.bricks.forEach(brick => {
      brick.hit(ball);
    });
  }

  this.addPowerUp = function (originx, originy){
    let rand = random();
    if (rand > 0.1){
      this.powerUps.push(new Powerup(originx , originy)); 
    }
  }

}

function AngleLine (){
  this.y = 380;
  this.angle = PI / 2;
  this.spinSpeed = 0.055;

  this.draw = function (){
    this.angle += this.spinSpeed;;
    if(this.angle > PI || this.angle < 0){
      this.spinSpeed *= -1;
    }

    let y2 = paddle.y - paddle.width -( sin(this.angle) * 20);
    let x2 = paddle.middle() - (cos(this.angle) * 20);
    //sohcahtoa
    line(paddle.middle(), paddle.y - paddle.width, x2, y2);
  }
}

function Paddle (){
  this.x = 200;
  this.y = 460 ;
  this.width = 80;
  this.height = 5;

  this.move = function (){
    if (mouseIsPressed){
      this.x = mouseX;
    }
  }

  this.middle = function (){
    return (this.x );
  }



  this.draw = function (){
    fill (130);
    ellipse(this.x, this.y, this.width, this.width);
  }
  this.hit = function (attacker){

    let x_dist = abs(attacker.x - this.x);
    let y_dist = abs(attacker.y - this.y);

    let mag = (attacker.x - this.x)/x_dist;

    let dist = sqrt(pow(x_dist , 2) + pow(y_dist ,2));

    let c_dist = this.width + attacker.size;

    // if dist is greater than cdist. there is collision
    // calc angle of rebound
    if (dist <= c_dist){
      attacker.bounce(atan(y_dist/x_dist), mag);
    }
  }
  this.hitPower= function (attacker){

    let x_dist = abs(attacker.x - this.x);
    let y_dist = abs(attacker.y - this.y);

    let mag = (attacker.x - this.x)/x_dist;

    let dist = sqrt(pow(x_dist , 2) + pow(y_dist ,2));

    let c_dist = this.width + 15;

    // if dist is greater than cdist. there is collision
    // calc angle of rebound
    if (dist <= c_dist){

      board.activePowers.push(attacker.power);
      board.activeTime = 10;
      board.powerUps.splice(board.powerUps.indexOf(attacker), 1);
      return true;
    }
    return false;
  }

}
function Ball (){
  this.x = paddle.middle();
  this.y = paddle.y - paddle.width - 10;
  this.stepx = 0;
  this.stepy = 0;
  this.speed = 8;
  this.angle = 135;
  this.size = 5;
  this.start = true;

  this.move = function(){
    if (this.y >= 400 -this.size){
      this.stepy =0;
      this.stepx = 0;
      this.x = 195;

      this.speed = 8;
      board.lives --;
      this.y = 370;
      this.start = true;
      // Dead ball
    }else if (this.y <= 0){
      this.stepy*=-1;
    }
    if (this.x >= 400 - this.size){
      this.stepx *= -1;
    }else if (this.x<=0){
      this.stepx *= -1;
    }
    this.y+= this.stepy;
    this.x+=this.stepx;
  }
  this.bounce = function(angle, mag){
    this.stepy = - sin(angle) * this.speed;
    this.stepx = mag * cos(angle) * this.speed;
  }

  this.draw = function (){

    fill(55);
    ellipse(this.x, this.y,this.size,this.size);
  }
    this.setup = function(){

      if( this.start){
        this.x = paddle.middle() ;
        this.y = paddle.y - paddle.width - 10;
      }
    }

  
}

function Brick (x,y, durability){
  this.x = x;
  this.y = y;
  this.colour = "rgb(255,255,0)";
  this.durability = durability;
  this.width = 50;
  this.height = 20;

  this.hit = function(attacker){
  
    let c_dist = attacker.size;
    // left 
    let in_left = abs(attacker.x - this.x) <= c_dist;
    let in_right = abs(attacker.x - (this.x + this.width)) <= c_dist;
    let in_top = abs(attacker.y - this.y) <= c_dist;
    let in_bottom = abs(attacker.y  - (this.y + this.height)) <= c_dist;

    let in_width = attacker.x > this.x && attacker.x < this.x + this.width;
    let in_height = attacker.y > this.y && attacker.y < this.y + this.height;



    if ((in_bottom || in_top)  && (in_width)) {
      attacker.stepy *= -1;
      attacker.speed += 0.02;
      board.addPowerUp(this.x + (this.width / 2), this.y + this.height);
    this.durability --;
    }
    else if ((in_left|| in_right) && (in_height)){
      attacker.stepx *= -1;
      attacker.speed += 0.02;
      board.addPowerUp(this.x + (this.width / 2), this.y + this.height);
    this.durability --;
    }
    

    
    if (this.durability === 0){
      board.bricks.splice(board.bricks.indexOf(this), 1);
    }
  }

  this.draw = function(){
    switch (this.durability){
      case 1: 
      this.colour = "rgb(255,255,0)";
        break;
      case 2:

      this.colour = "rgb(0,55,255)";
        break;
      case 3:
      this.colour = "rgb(255,55,255)";

        break;
      case 4:
      this.colour = "rgb(55,55,255)";
        break;
      case 5:
      this.colour = "rgb(0,55,55)";
        break;

    }

    if (this.durability === 1){

    }
    else{

    }
    fill(this.colour);
    rect (this.x, this.y, this.width, this.height);
  }
}
function Powerup(originx, originy){
  this.x = originx;
  this.y = originy;
  this.speed = 2;
  this.power = "PADDLE_SIZE";

  this.drop = function(){
    this.y += this.speed;
  }

  this.draw = function() {
    fill("rgb(0,255,0)");
    triangle(this.x, this.y, this.x - 10, this.y + 15, this.x + 10, this.y + 15);
  }
  // falling object (triangle)
  // coloured
  // increase paddle size for a duration
  // increase speed of ball
  // add more balls to game (challenge)
  // increase size of ball (larger collision radius)
  // Random chance of occuring after brick breack
}

function mouseReleased() {
  if (ball.start){
    ball.stepy = - sin(angleLine.angle) * ball.speed;
    ball.stepx = -cos(angleLine.angle) * ball.speed;
    ball.start = false;

  }
  return false;
}


