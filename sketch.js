function setup() {
  createCanvas(1000, 650);
  frameRate(30);
  background(250);

  var h = 50,
  w = 600;
  Bar = new Beam([h,w], [100,height/4]);
  Bar.color = color('rgb(255,255,255)');
  Bar.shearDiagram.display = 200;
  Bar.momentDiagram.display = (200 + 200);
  Bar.creationDelay = 300; //ms
}



function draw() {

  background(250);

  Bar.update();
  Bar.display();

}
