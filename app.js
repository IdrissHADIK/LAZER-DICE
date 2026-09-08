const $=s=>document.querySelector(s);
let state=JSON.parse(localStorage.getItem("lazerDice")||'{"balance":1000,"rolls":0,"wins":0,"best":0,"vip":0,"history":[],"theme":"Neon"}');
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
document.querySelectorAll(".color-dot").forEach(btn=>btn.onclick=()=>{
 const n=btn.dataset.color;
 const d=$("#dice");
 for(let i=1;i<=6;i++) d.classList.remove("color-"+i);
 d.classList.add("color-"+n);
 document.querySelectorAll(".color-dot").forEach(x=>x.classList.remove("selected"));
 btn.classList.add("selected");
});
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
 const die=Math.floor(Math.random()*6)+1, win=die>=4, points=win?stake:stake;
 state.balance += win?stake:-stake; state.rolls++; if(win)state.wins++; state.best=Math.max(state.best,die);
 state.history.unshift({roll:state.rolls,die,win,points});state.history=state.history.slice(0,20);
 $("#dice").textContent=die;$("#dice").classList.remove("roll");void $("#dice").offsetWidth;$("#dice").classList.add("roll");
 $("#result").textContent=win?`🎉 You rolled ${die}! +${stake} virtual points`:`You rolled ${die}. -${stake} virtual points`;
 render();
};
$("#resetBtn").onclick=()=>{if(confirm("Reset your virtual points and progress?")){state={balance:1000,rolls:0,wins:0,best:0,vip:0,history:[],theme:"Neon"};location.reload()}};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$("#"+b.dataset.view).classList.add("active")});
render();
