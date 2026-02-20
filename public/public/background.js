document.addEventListener("DOMContentLoaded", function(){

  const rain=document.createElement("div");
  rain.className="rain";

  for(let i=0;i<60;i++){
    const drop=document.createElement("span");
    drop.style.left=Math.random()*100+"%";
    drop.style.animationDuration=(2+Math.random()*3)+"s";
    drop.style.animationDelay=Math.random()*5+"s";
    rain.appendChild(drop);
  }

  const ground=document.createElement("div");
  ground.className="ground";

  document.body.appendChild(rain);
  document.body.appendChild(ground);

});
