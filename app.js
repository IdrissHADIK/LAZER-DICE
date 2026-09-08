const $=s=>document.querySelector(s);
let state=JSON.parse(localStorage.getItem("lazerDice")||'{"balance":1000,"rolls":0,"wins":0,"best":0,"vip":0,"history":[],"theme":"Neon","playerName":""}');
if(!state.playerName) state.playerName="";
const vipTiers=[
 {level:0,name:"Rookie",need:0,bonus:"Starter badge"},
 {level:1,name:"Silver",need:1000,bonus:"Silver badge + theme"},
 {level:2,name:"Gold",need:3000,bonus:"Gold badge + theme"},
 {level:3,name:"Diamond",need:7000,bonus:"Diamond badge + premium theme"}
];
const themes=[
 {name:"Neon",vip:0,style:"linear-gradient(135deg,#111a4b,#7d18d8,#081126)"},
 {name:"Midnight",vip:1,style:"linear-gradient(135deg,#02040d,#182b55,#071a20)"},
 {name:"Royal Gold",vip:2,style:"linear-gradient(135deg,#170f02,#9b6505,#17100a)"},
 {name:"Diamond",vip:3,style:"linear-gradient(135deg,#03122a,#0a86b5,#2730a8)"}
];
function save(){localStorage.setItem("lazerDice",JSON.stringify(state));}
function currentVip(){let t=vipTiers[0];for(const x of vipTiers)if(state.rolls*100>=x.need)t=x;return t}
function render(){
 renderLeaderboards();
 $("#playerName").textContent=state.playerName ? "👤 "+state.playerName : "";
 const v=currentVip(); state.vip=v.level;
 $("#balance").textContent=state.balance.toLocaleString()+" pts"; $("#vipBadge").textContent="VIP "+v.level;
 $("#rolls").textContent=state.rolls; $("#wins").textContent=state.wins; $("#best").textContent=state.best;
 renderVip(); renderThemes(); renderHistory(); save();
}
function renderVip(){
 $("#vipCards").innerHTML=vipTiers.map(t=>`<div class="tier"><h3>${t.level===0?"🎲":"👑"} ${t.name}</h3><p>Earn ${t.need.toLocaleString()} play points.</p><p>${t.bonus}</p><button ${state.vip>=t.level?"":"disabled"}>${state.vip>=t.level?"Unlocked":"Locked"}</button></div>`).join("");
}
function renderThemes(){
 $("#themeCards").innerHTML=themes.map(t=>`<div class="theme ${state.theme===t.name?"selected":""}" data-theme="${t.name}" style="background:${t.style}"><span>${t.name}${t.vip?" • VIP "+t.vip:" • FREE"}</span></div>`).join("");
 document.querySelectorAll(".theme").forEach(el=>el.onclick=()=>{const t=themes.find(x=>x.name===el.dataset.theme);if(state.vip>=t.vip){state.theme=t.name;document.body.style.backgroundImage=t.vip?`linear-gradient(135deg,rgba(4,6,20,.78),rgba(25,5,50,.55)),${t.style}`:'url("assets/background.png")';renderThemes();save();}});
}
const colorNames=["Red","Blue","Yellow","Orange","Purple","Green"];
let selectedColor=1;
document.querySelectorAll(".color-option").forEach(btn=>btn.onclick=()=>{
 const n=Number(btn.dataset.color); selectedColor=n;
 document.querySelectorAll(".color-option").forEach(x=>x.classList.remove("selected"));
 btn.classList.add("selected");
 $("#result").textContent=`Selected color: ${colorNames[n-1]}. Now roll 4 dice.`;
});
function setResultColors(results,animate=false){
 const boxes=[...document.querySelectorAll(".result-die")];
 boxes.forEach((box,i)=>{
  for(let c=1;c<=6;c++) box.classList.remove("color-"+c);
  const n=results[i]; box.classList.add("color-"+n); box.textContent=colorNames[n-1].toUpperCase();
  if(animate){box.classList.remove("roll");void box.offsetWidth;box.classList.add("roll");}
 });
}

function renderLeaderboards(){
 const players=[
  ["👑","DiceKing",12450],["⚡","LuckyGirl",10820],["🔥","Razor",9420],["💎","NovaDice",8170],["🎯","PlayerX",7350]
 ];
 const wins=[
  ["🥇","DiceKing",520],["🥈","LuckyGirl",461],["🥉","Razor",418],["⭐","NovaDice",377],["🎲","PlayerX",341]
 ];
 const row=(x,i)=>`<div class="lb-row"><span class="lb-rank">${i+1}</span><span class="lb-avatar">${x[0]}</span><span class="lb-name">${x[1]}</span><span class="lb-value">${x[2].toLocaleString()}</span></div>`;
 $("#playersBoard").innerHTML=players.map(row).join("");
 $("#winsBoard").innerHTML=wins.map(row).join("");
}
function renderHistory(){
 $("#historyList").innerHTML=state.history.length?state.history.map(x=>`<div><span>Roll ${x.roll}: <b>${x.die}</b></span><span class="${x.win?'win':'lose'}">${x.win?"+":"-"}${x.points} pts</span></div>`).join(""):"<p>No rolls yet. Your history will appear here.</p>";
}
$("#rollBtn").onclick=()=>{
 const stake=Math.max(10,Math.min(250,Number($("#stake").value)||50));
 if(stake>state.balance){$("#result").textContent="Not enough virtual points.";return}
 const results=Array.from({length:4},()=>Math.floor(Math.random()*6)+1);
 const hits=results.filter(n=>n===selectedColor).length;
 const win=hits>0;
 state.balance += win?stake:-stake; state.rolls++; if(win)state.wins++; state.best=Math.max(state.best,win?stake:0);
 const resultNames=results.map(n=>colorNames[n-1]);
 state.history.unshift({roll:state.rolls,die:resultNames.join(" • "),win,points:stake}); state.history=state.history.slice(0,20);
 setResultColors(results,true);
 const selectedName=colorNames[selectedColor-1];
 $("#result").textContent=win?`🎉 ${selectedName} appeared ${hits} time${hits>1?"s":""}! +${stake} virtual points`:`${selectedName} did not appear. -${stake} virtual points`;
 render();
};
$("#resetBtn").onclick=()=>{if(confirm("Reset your virtual points and progress?")){state={balance:1000,rolls:0,wins:0,best:0,vip:0,history:[],theme:"Neon",playerName:""};location.reload()}};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$("#"+b.dataset.view).classList.add("active")});
render();


// First-visit player name
const nameModal=$("#nameModal"), nameInput=$("#nameInput"), nameSave=$("#nameSave"), nameError=$("#nameError");
function showNameModal(){
  nameModal.classList.add("show");
  setTimeout(()=>nameInput.focus(),50);
}
function savePlayerName(){
  const name=nameInput.value.trim().replace(/\s+/g," ");
  if(name.length<2){nameError.textContent="Please enter at least 2 characters.";return;}
  state.playerName=name.slice(0,18);
  save();
  nameError.textContent="";
  nameModal.classList.remove("show");
  render();
}
nameSave.onclick=savePlayerName;
nameInput.addEventListener("keydown",e=>{if(e.key==="Enter")savePlayerName();});
if(!state.playerName) showNameModal();
