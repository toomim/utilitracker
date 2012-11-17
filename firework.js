var firework_timer;

function start_fireworks() {
 function fireworks(){
   new firework();
   new firework();
  }
  firework_timer = setInterval(fireworks,400);	
}

function stop_fireworks() {
	clearInterval(firework_timer);
	firework_timer = null;
}

var firework = function(){
 this.size = 40;
 this.speed = 0.1;
 this.rise();
}

firework.prototype = {
 color:function(){
  var c = ['0','3','6','9','c','f'];
  var t = [c[Math.floor(Math.random()*100)%6],'0','f'];
  t.sort(function(){return Math.random()>0.5?-1:1;});
  return '#'+t.join('');
 },
 aheight:function(){
  var h = document.documentElement.clientHeight;
  return Math.abs(Math.floor(Math.random()*h-200))+201;
 },
 firecracker:function(){
  var b = document.createElement('div');
  var w = document.body.clientWidth;
  b.style.color = this.color();
  b.style.position = 'absolute';
  b.style.bottom = 0;
  b.style.left = Math.floor(Math.random()*w)+1+'px';
  document.body.appendChild(b);
  return b;
 },
 rise:function(){
  var o = this.firecracker();
  var n = this.aheight();
  var speed = this.speed;
  var e = this.expl;
  var s = this.size;
  var k = n;
  var m = function(){
   o.style.bottom = parseFloat(o.style.bottom)+k*speed+'px';
   k-=k*speed;
   if(k<2){
	clearInterval(clear);
	e(o,n,s,speed);
   }
  }
  o.innerHTML = '*';
  if(parseInt(o.style.bottom)<n){
   var clear = setInterval(m,20);
  }
 },
 expl:function(o,n,s,speed){
  var R = n/3;
  var Ri = n/6;
  var r = 0;
  var ri = 0;
  for(var i=0;i<s;i++){
   var span = document.createElement('span');
   var p = document.createElement('p');
   span.style.position = 'absolute';
   span.style.left = 0;
   span.style.top = 0;
   span.innerHTML = '*';
   p.style.position = 'absolute';
   p.style.left = 0;
   p.style.top = 0;
   p.innerHTML = '+';
   o.appendChild(span);
   o.appendChild(p);
  }
  function spr(){
   r += R*speed;
   ri+= Ri*speed/2;
   sp = o.getElementsByTagName('span');
   p = o.getElementsByTagName('p');
   for(var i=0; i<sp.length;i++){
	sp[i].style.left=r*Math.cos(360/s*i)+'px';
	sp[i].style.top=r*Math.sin(360/s*i)+'px';
	p[i].style.left=ri*Math.cos(360/s*i)+'px';
	p[i].style.top=ri*Math.sin(360/s*i)+'px';
   }
   R-=R*speed;
   if(R<2){
	clearInterval(clearI);
	o.parentNode.removeChild(o);
   }
  }
  var clearI = setInterval(spr,20);
 }
}