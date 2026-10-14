'use strict';
const native=window.greyhavenNative,profile=document.querySelector('#profile'),cases=document.querySelector('#cases'),play=document.querySelector('#play');let boot=native.boot(),installed=[],selected='tutorial-gh01';
const error=message=>{const box=document.querySelector('#error');box.textContent=message;box.hidden=!message;};
function unlocked(id){if(id==='tutorial-gh01')return true;const n=Number(id.slice(-2)),previous=n===1?'tutorial-gh01':'s1-e'+String(n-1).padStart(2,'0');return !!boot.profiles.find(p=>p.id===boot.active)?.completed?.includes(previous);}
function choose(id){selected=id;render();}
function render(){
 profile.replaceChildren();if(!boot.profiles.length){const fresh=document.createElement('option');fresh.value='';fresh.textContent='Neues Profil im Spiel anlegen';profile.append(fresh);}
 for(const entry of boot.profiles){const option=document.createElement('option');option.value=entry.id;option.textContent='Detective '+entry.name;profile.append(option);}profile.value=boot.active||'';
 const entry=installed.find(e=>e.id===selected),allowed=unlocked(selected)&&!!entry;play.disabled=!allowed;document.querySelector('#selected-title').textContent=entry?.title||'Episode '+selected.slice(-2);document.querySelector('#selected-label').textContent=selected==='tutorial-gh01'?'TUTORIAL · INSTALLIERT':'EPISODE '+selected.slice(-2)+' · INSTALLIERT';
 document.querySelector('#selected-note').textContent=selected==='tutorial-gh01'?'Ein vermisster Junge. Eine Nachricht, die Fragen aufwirft. Ihr erster eigener Fall – mit Unterstützung durch Ellis.':'Setzen Sie Ihre Ermittlungen und die Geschichte von Greyhaven fort.';
 cases.replaceChildren();
 for(let n=0;n<=13;n++){
  const id=n?'s1-e'+String(n).padStart(2,'0'):'tutorial-gh01',available=installed.some(e=>e.id===id),open=unlocked(id),button=document.createElement('button');button.className='case';button.setAttribute('aria-pressed',String(id===selected));button.disabled=!open||!available;
  const state=document.createElement('small');state.textContent=!open?'🔒 GESPERRT':available?'INSTALLIERT':'NOCH NICHT VERÖFFENTLICHT';const title=document.createElement('strong');title.textContent=n?'Episode '+String(n).padStart(2,'0'):'Tutorial';button.append(state,title);button.title=!open?'Schließen Sie den vorherigen Fall ab.':!available?'Dieser Fall ist noch nicht veröffentlicht.':'Fall auswählen';button.addEventListener('click',()=>choose(id));cases.append(button);
 }
 document.querySelector('#version').textContent='GREYHAVEN · '+(installed.find(e=>e.id==='tutorial-gh01')?.version||'');
}
async function refresh(){installed=await native.episodes();boot=native.boot();if(!unlocked(selected)||!installed.some(e=>e.id===selected))selected='tutorial-gh01';render();}
function status(value){document.querySelector('#status').textContent=value.message;const progress=document.querySelector('#progress');progress.hidden=!value.progress;progress.value=value.progress?.total?value.progress.received/value.progress.total:0;document.querySelector('#check').disabled=['checking','downloading'].includes(value.state);if(['ready','launcher-update'].includes(value.state))refresh().catch(()=>{});}
profile.addEventListener('change',async()=>{error('');try{if(profile.value){boot=await native.selectProfile(profile.value);selected=boot.caseId||'tutorial-gh01';}render();}catch{error('Das Profil konnte nicht geöffnet werden. Ihre Spielstände bleiben erhalten.');}});
play.addEventListener('click',async()=>{error('');play.disabled=true;try{await native.launchEpisode(selected);}catch(errorValue){error(errorValue.message||'Der Fall konnte nicht geöffnet werden.');play.disabled=false;}});
document.querySelector('#quit').addEventListener('click',()=>native.quit());document.querySelector('#check').addEventListener('click',()=>native.checkUpdates().then(status));native.onUpdate(status);native.updateStatus().then(status);refresh().catch(()=>error('Die installierten Fälle konnten nicht gelesen werden.'));
