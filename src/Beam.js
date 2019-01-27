/**
* Draws an arrow from one point to another. Useful for vector diagramming.
* @constructor Beam

* @param {Matrix} size_ A vector object describing [height, width]
* @param {Matrix} position_ A vector object describing [position x, position y]

* @property {bool} shearDiagram.display Indicates the y position of shear diagram respect to the beam diagram. (default: false)
* @property {bool} momentDiagram.display Indicates the y position of moment diagram respect to the beam diagram . (default: false)
* @property {color} color The color of the Beam. (default: white)
* @property {number } creationInterval The inteval time of arrow creation in ms  (default 300)
* @property {number } w The length of Beam in cm.

* @property Beam.display() {method} Displays the Beam object.
* @property Beam.update() {method} Updates the Beam object.
*/

function Beam(size_, position_){

  this.h = size_[0]
  this.w = size_[1]

  this.x = position_[0]
  this.y = position_[1]

  this.createArrow = true;

  this.shearDiagram = new Array(this.w).fill(0);
  this.momentDiagram = new Array(this.w).fill(0);
  this.shearDiagram.display = false;
  this.momentDiagram.display = false;

  this.Arrow = [];
  this.lastCreateTime = new Date().getTime();
  this.creationInterval = 300; //ms
  this.color = color('rgb(255,255,255)');

  this.display = function() {

    fill(this.color);

    // rect(x, y, w, h, [tl], [tr], [br], [bl])
    this.target = rect(this.x, this.y, this.w, this.h);

    createAxis('x',this,this.x,this.y + this.h)

    //create stands
    // triangle(x1, y1, x2, y2, x3, y3)
    fill('rgb(253, 203, 110)');
    var standY = this.y + this.h
    triangle(this.x-30, standY+30, this.x, standY, this.x+30, standY+30)
    triangle(this.x+this.w-30, standY+30, this.x+this.w, standY, this.x+this.w+30, standY+30)

    //x axis
    // line(x1, y1, x2, y2)

    if (this.shearDiagram.display) {
      var dist = this.shearDiagram.display
      line(this.x, this.y+dist, this.x+this.w, this.y+dist)
      renderLine(this.x, this.y+dist, this.shearDiagram, 'shear');
      createAxis('x',this,this.x,this.y+dist)
      createAxis('y',this,this.x,this.y + dist, 50)
    }

    if (this.momentDiagram.display) {
      var dist = this.momentDiagram.display
      line(this.x, this.y+dist, this.x+this.w, this.y+dist)
      renderLine(this.x, this.y+dist, this.momentDiagram, 'moment');
      createAxis('x',this,this.x,this.y+dist)
      createAxis('y',this,this.x,this.y + dist, 50)
    }

    // UI
    var total = this.Arrow.filter(index => index.active).length
    //Title
    var posY = this.y - 80;
    text( 'Name ', this.x + this.w + 100, posY);
    text( 'Locat.', this.x + this.w + 140 + 20, posY);
    text( 'Magnitude', this.x + this.w + 200 + 20, posY);

    //Data
    for (let j = 0;j<total;j++) {
      var posY = this.y - 50 + (30*j);
      textSize(16);
      text( 'Force '+j, this.x + this.w + 100, posY);
      text( (this.Arrow[j].target.x - this.x) / 100 + 'm', this.x + this.w + 150 + 20, posY);
      text( '10 kN', this.x + this.w + 200 + 25, posY);
    }
  }

  this.update = function(){
    // check if the mouse is inside the forceArea
    if (this.forceArea && mouseX >= this.forceArea.x && mouseX <= this.forceArea.x + this.w &&
      mouseY >= this.forceArea.y && mouseY <= this.forceArea.y + this.forceArea.h) {

        if(new Date().getTime() - this.lastCreateTime >= this.creationInterval && mouseIsPressed && !this.createArrow) {
          var latestArrow = this.Arrow[this.Arrow.length-1];
          latestArrow.active = true;
          this.createArrow = true;
          this.lastCreateTime = new Date().getTime();

          singularityFn(this)
        }

        push();
        fill('rgb(223, 230, 233)');
        forceAreaInit(this);

        if (this.createArrow) {
          createArrow(this)
        }

        updateArrow(this,true)
        pop();

      } else {

        push();
        fill('rgb(178, 190, 195)');
        forceAreaInit(this)

        updateArrow(this,false)
        pop();

        if(!this.createArrow)
        this.createArrow = true;
      }
    }

  }

  function forceAreaInit(parent) {
    parent.forceAreaRange = 100

    push();
    noStroke();
    parent.forceArea = rect(parent.x, parent.y-parent.forceAreaRange, parent.w, parent.forceAreaRange);
    parent.forceArea.x = parent.x;
    parent.forceArea.y = parent.y-parent.forceAreaRange;
    parent.forceArea.w = parent.y-parent.forceAreaRange;
    parent.forceArea.h = parent.forceAreaRange;

    if(parent.Arrow.length<=0) {
      textSize(40);
      stroke('rgb(9, 132, 227)');
      fill('rgb(223, 230, 233)');
      text( 'Hover Here to Create Force!', parent.x + parent.forceArea.w/2 + 15, parent.y-parent.forceAreaRange/2 + 15);
    }

    pop();
  }

  function createArrow(parent) {

    var origin = createVector(mouseX,parent.forceArea.y)
    var target = createVector(mouseX,parent.y-10) //-10 for the arrow tip
    parent.Arrow.push(new Arrow(origin, target))
    parent.Arrow[parent.Arrow.length-1].color="green";
    parent.Arrow[parent.Arrow.length-1].grab = false;
    parent.Arrow[parent.Arrow.length-1].draggable = false;
    parent.Arrow[parent.Arrow.length-1].showComponents = false;
    parent.Arrow[parent.Arrow.length-1].active = false;
    parent.createArrow = false;
  }

  function updateArrow(parent,mode) {

    for(let i = 0;i<parent.Arrow.length;i++) {

      if(mode && i==parent.Arrow.length-1) {
        parent.Arrow[i].origin.x = mouseX; //Move the latest arrow bar
        parent.Arrow[i].target.x = mouseX; //Move the latest arrow bar
      }
      parent.Arrow[i].update();
      parent.Arrow[i].display();

      fill('rgb(214, 48, 49)');
      text('10 kN', parent.Arrow[i].origin.x - 25, parent.forceArea.y - 5);
    }

    //remove arrow when exit the forceArea
    if(!mode && parent.Arrow[parent.Arrow.length-1] && !parent.Arrow[parent.Arrow.length-1].active && !parent.createArrow) {
      parent.Arrow.pop() //remove the last arrow
    } else {
      parent.createArrowClick = false;
    }
  }

  function renderPoints(targetX, targetY, target, mode) {
    //this function puts ellipses at all the positions defined above.
    push();
    noStroke()

    for (var x = 0; x < target.length; x += 1) {
      fill(0);
      if(target[x]!=0)
      ellipse(targetX+x, targetY-target[x], 5, 5);
    }
    pop();
  }

  function renderLine(targetX, targetY, target, mode) {
    //this function puts a line through all the positions defined above.

    push();
    noFill();
    if (mode=='shear') {
      stroke('rgb(9, 132, 227)');
    } else {
      stroke('rgb(214, 48, 49)');
    }

    beginShape();

    var firstX = 0;
    var secondX = false;
    var firstY = 0;
    var secondY = target[0];
    for (let x = 0; x < target.length; x += 1) {
      if(!secondX && secondY!=target[x] || x==target.length-1) {
        secondX = x

        if (mode=='moment') {
          secondY = target[x];
          if (target[x]==0)
          continue;
        }

      } else {
        continue;
      }
      // curveVertex(targetX+x, targetY-target[x]);
      if(mode=='shear') {
        line(targetX+firstX, targetY-firstY, targetX+firstX, targetY-secondY) // vertical line
        line(targetX+firstX, targetY-secondY, targetX+secondX, targetY-secondY) // horizontal line
      } else if(mode=='moment') {
        line(targetX+firstX, targetY-firstY, targetX+secondX, targetY-secondY) // horizontal line
      }

      secondX = false;
      firstX = x;

      firstY = secondY;
      secondY = target[x];
    }


    if(mode=='shear')
    line(targetX+firstX, targetY-secondY, targetX+firstX, targetY) // close vertical line
    // else if(mode=='moment') {
    //   line(targetX+firstX, targetY-firstY, targetX+secondX, targetY-secondY) // horizontal line
    // }

    endShape();
    pop();
  }

  function singularityFn(parent) {

    // First, find the force at the edge
    var total = parent.Arrow.filter(index => index.active).length
    var sumForce = 0;
    for (let j = 0;j<total;j++) {
      sumForce += 10*(parent.shearDiagram.length-(parent.Arrow[j].target.x-parent.x))
    }
    // half = 10*total/2 //This only true when force is at L/2....
    half = sumForce/parent.shearDiagram.length

    //singularityFn
    for(let i = 0;i<parent.shearDiagram.length;i++) {

      if(i>0) {
        parent.shearDiagram[i] = half
        parent.momentDiagram[i] = half*i/100
      } else if(i==parent.shearDiagram.length-1) {
      }

      //if (x>=a) = (x-a)^n
      for (let j = 0;j<total;j++) {
        if(i>=(parent.Arrow[j].target.x-parent.x)) {
          parent.shearDiagram[i] -= 10
          parent.momentDiagram[i] -= 10*(i-(parent.Arrow[j].target.x-parent.x) )/100
        }
      }
    }
  }

  function createAxis(type,parent,x,y,magnitude) {

    switch(type) {
      case 'x':
      for(let i = 1; i<=parent.w/100;i++) {
        fill('rgb(45, 52, 54)');
        textSize(16);
        text(i, x+(i*100) - 3, y - 7);
        line(x+(i*100), y - 5, x+(i*100), y + 5) // axis line
      }
      break;

      case 'y':
      line(x, y - 50, x, y + 50) // axis line

      for(let i = 1; i<=magnitude/10;i++) {

        if(i % 2 == 0) //skip even line to avoid massy axis
        continue

        fill('rgb(45, 52, 54)');
        textSize(16);
        text((i*10), x - 30, y - (i*10) + 5); //pos
        text((i*-10), x - 30 - 5, y + (i*10) + 5); //neg
        line(x - 5, y -(i*10), x + 5, y -(i*10) ) // axis line
        line(x - 5, y +(i*10), x + 5, y +(i*10) ) // axis line
      }
      break;
    }
  }
