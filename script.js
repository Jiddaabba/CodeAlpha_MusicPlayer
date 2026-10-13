/* JiddaBeats — vanilla JavaScript music player
   Demo audio uses public sample tracks. Replace audio URLs with music you own or are licensed to distribute. */
const TRACKS = [
  {id:'t1',title:'Midnight City Lights',artist:'Nova Lane',album:'After Hours',duration:'',genre:'Electronic',cover:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
  {id:'t2',title:'Golden Hour',artist:'Mila Rivers',album:'Soft Horizons',genre:'Chill',cover:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'},
  {id:'t3',title:'After the Rain',artist:'The Northbound',album:'Quiet Roads',genre:'Indie',cover:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'},
  {id:'t4',title:'Purple Skies',artist:'Kaya Sol',album:'Neon Bloom',genre:'R&B',cover:'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'},
  {id:'t5',title:'Electric Dreams',artist:'Pixel Hearts',album:'Future Nostalgia',genre:'Electronic',cover:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'},
  {id:'t6',title:'Velvet Groove',artist:'Juno & June',album:'Blue Notes',genre:'R&B',cover:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'},
  {id:'t7',title:'Open Road',artist:'Mason Reed',album:'Wide Awake',genre:'Indie',cover:'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'},
  {id:'t8',title:'Slow Motion',artist:'Remi Blue',album:'Soft Horizons',genre:'Chill',cover:'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'},
  {id:'t9',title:'Heartbeat FM',artist:'Luna Park',album:'Neon Bloom',genre:'Pop',cover:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'},
  {id:'t10',title:'Blue Hour',artist:'Sami Wells',album:'After Hours',genre:'Chill',cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=85',audio:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'}
];
const PLAYLISTS = [
  {id:'p1',name:'Afrobeats Vibes',emoji:'🌅',description:'Warm rhythms and feel-good energy.',trackIds:['t1','t4','t9','t6'],cover:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=85'},
  {id:'p2',name:'Chill & Relax',emoji:'🌊',description:'Slow down and take a breath.',trackIds:['t2','t8','t3'],cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=85'},
  {id:'p3',name:'Hip Hop Essentials',emoji:'🎧',description:'Deep cuts for your everyday soundtrack.',trackIds:['t3','t7','t1'],cover:'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=85'},
  {id:'p4',name:'R&B Classics',emoji:'💜',description:'Smooth vocals, softer nights.',trackIds:['t4','t6','t8'],cover:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=85'},
  {id:'p5',name:'Electronic Dreams',emoji:'🌌',description:'A little neon for your headphones.',trackIds:['t5','t9','t1'],cover:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=85'},
  {id:'p6',name:'Rock Anthems',emoji:'🎸',description:'Big moods and bigger hooks.',trackIds:['t7','t3','t5'],cover:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=85'}
];
const $ = id => document.getElementById(id);
const externalTracks = [];
const localTracks = [];
let discoverRequest = 0, discoverTimer = null;
const audio = $('audio');
let currentTrackId = null;
let queue = TRACKS.map(t=>t.id);
let queueIndex = 0;
let favorites = new Set(readStore('jb-favorites', []));
let customPlaylists = readStore('jb-playlists', []);
let recent = readStore('jb-recent', []);
let isShuffle = false, repeatMode = 0, previousVolume = .75, currentView = 'home', activePlaylistId = null, toastTimer;
audio.volume = .75;

function readStore(key, fallback){ try { const val=JSON.parse(localStorage.getItem(key)); return val ?? fallback; } catch { return fallback; } }
function writeStore(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function trackById(id){ return TRACKS.find(t=>t.id===id) || externalTracks.find(t=>t.id===id) || localTracks.find(t=>t.id===id); }
function allTracks(){ return [...TRACKS, ...externalTracks, ...localTracks]; }
function allPlaylists(){ return [...PLAYLISTS,...customPlaylists]; }
function formatTime(seconds){ if(!Number.isFinite(seconds)||seconds<0)return '0:00'; return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`; }
function showToast(message){ const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2400); }
function safeText(text){ return String(text).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function init(){
  $('year').textContent=new Date().getFullYear();
  $('themeToggle').textContent=document.body.classList.contains('light')?'☀':'☾';
  renderPlaylists(); renderSidebarPlaylists(); renderTracks(); renderQueue();
  audio.volume=.75; $('volumeBar').style.setProperty('--fill','75%');
  if(recent.length===0) recent=TRACKS.slice(0,5).map(t=>t.id);
  $('favoriteCount').textContent=favorites.size;
  $('downloadBtn').disabled=true;
  bindEvents();
  setTheme(readStore('jb-theme','dark'),false);
  setView('home');
}
function renderPlaylists(){
  $('playlistGrid').innerHTML=allPlaylists().map(p=>`<article class="playlist-card" tabindex="0" data-playlist="${p.id}">
    <div class="playlist-cover-wrap"><img class="playlist-cover" src="${p.cover||trackById(p.trackIds[0])?.cover||TRACKS[0].cover}" alt="${safeText(p.name)} artwork" loading="lazy"><button class="card-play" data-playlist-play="${p.id}" aria-label="Play ${safeText(p.name)}">▶</button></div>
    <h3>${safeText(p.name)}</h3><p>${p.trackIds.length} tracks · ${safeText(p.description||'Your personal collection')}</p></article>`).join('');
}
function renderSidebarPlaylists(){
  $('sidebarPlaylists').innerHTML=allPlaylists().slice(0,8).map(p=>`<button class="side-playlist" data-playlist="${p.id}"><span class="playlist-emoji">${p.emoji||'♫'}</span><span>${safeText(p.name)}<small>${p.trackIds.length} tracks</small></span></button>`).join('');
}
function visibleTracks(){
  const query=$('searchInput').value.trim().toLowerCase();
  let tracks=allTracks();
  if(currentView==='favorites') tracks=tracks.filter(t=>favorites.has(t.id));
  else if(currentView==='library') tracks=allTracks();
  else if(currentView==='discover') tracks=TRACKS.slice().sort((a,b)=>a.genre.localeCompare(b.genre));
  else if(currentView==='playlists'&&activePlaylistId){const p=allPlaylists().find(x=>x.id===activePlaylistId);tracks=TRACKS.filter(t=>p?.trackIds.includes(t.id));}
  else if(currentView==='home') tracks=(recent.length?recent:TRACKS.map(t=>t.id)).map(trackById).filter(Boolean);
  if(query) tracks=allTracks().filter(t=>[t.title,t.artist,t.album,t.genre].some(v=>(v||'').toLowerCase().includes(query)));
  if(currentView==='discover' && !query) tracks=TRACKS.slice().sort((a,b)=>a.genre.localeCompare(b.genre));
  return tracks;
}
function renderTracks(){
  const tracks=visibleTracks();
  const list=$('trackList');
  list.innerHTML=tracks.map(t=>trackRow(t)).join('');
  $('emptyState').classList.toggle('hidden',tracks.length!==0);
  list.classList.toggle('hidden',tracks.length===0);
  if(currentView==='favorites'){$('trackHeading').textContent='Your favorites';$('trackEyebrow').textContent='THE ONES YOU LOVE';$('trackSubheading').textContent=`${favorites.size} liked tracks`;}
  else if(currentView==='discover'){$('trackHeading').textContent='JiddaBeats collection';$('trackEyebrow').textContent='YOUR STARTING POINT';$('trackSubheading').textContent=`${allTracks().length} tracks in this session`;}
  else if(currentView==='library'){$('trackHeading').textContent='Your library';$('trackEyebrow').textContent='ALL YOUR MUSIC';$('trackSubheading').textContent=`${TRACKS.length} tracks`;}
  else if(currentView==='playlists'){$('trackHeading').textContent='Your playlists';$('trackEyebrow').textContent='MADE BY YOU';$('trackSubheading').textContent='Choose a playlist above';}
  else if($('searchInput').value.trim()){$('trackHeading').textContent='Search results';$('trackEyebrow').textContent='MATCHES FOR YOUR SEARCH';$('trackSubheading').textContent=`${tracks.length} results`;}
  else {$('trackHeading').textContent='Recently played';$('trackEyebrow').textContent='KEEP THE VIBE GOING';$('trackSubheading').textContent='Your rotation';}
}
function trackRow(t){
  const liked=favorites.has(t.id), current=t.id===currentTrackId;
  return `<div class="track-row ${current?'is-current':''}" data-track-row="${t.id}">
    <button class="track-main" data-play-track="${t.id}" aria-label="Play ${safeText(t.title)}">
      <img class="track-cover" src="${t.cover}" alt="" loading="lazy"><span class="track-info"><strong>${safeText(t.title)}</strong><span>${safeText(t.artist)}</span></span>
    </button><span class="track-album">${safeText(t.album)}</span><span class="track-duration">${t.duration||'—:——'}</span>
    <span class="track-actions"><button class="track-action ${liked?'liked':''}" data-favorite="${t.id}" aria-label="${liked?'Remove from':'Add to'} favorites">${liked?'♥':'♡'}</button><button class="track-action" data-add-queue="${t.id}" aria-label="Add ${safeText(t.title)} to queue" title="Add to queue">＋</button></span>
  </div>`;
}
function renderQueue(){
  $('queueList').innerHTML=queue.map((id,i)=>{const t=trackById(id);if(!t)return '';return `<div class="queue-row ${id===currentTrackId?'current':''}" data-queue-track="${id}"><img src="${t.cover}" alt=""><div><strong>${safeText(t.title)}</strong><span>${safeText(t.artist)}</span></div><time>${t.duration||'♫'}</time></div>`}).join('')||'<p class="subtle-label">Your queue is empty.</p>';
}
function setView(view){
  currentView=view; activePlaylistId=null;
  document.querySelectorAll('.nav-link[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $('playlistDetailSection').classList.add('hidden');
  $('featuredSection').classList.toggle('hidden',view==='favorites'||view==='library'||view==='discover');
  $('discoverSection').classList.toggle('hidden',view!=='discover');
  $('hero').classList.toggle('hidden',view==='favorites'||view==='library'||view==='discover');
  $('tracksSection').classList.remove('hidden');
  renderTracks(); closeMobileMenu();
  window.scrollTo({top:0,behavior:'smooth'});
}
function openPlaylist(id){
  const p=allPlaylists().find(x=>x.id===id);if(!p)return;
  activePlaylistId=id;currentView='playlists';
  document.querySelectorAll('.nav-link[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='playlists'));
  $('hero').classList.add('hidden');$('featuredSection').classList.add('hidden');$('discoverSection').classList.add('hidden');$('tracksSection').classList.add('hidden');$('playlistDetailSection').classList.remove('hidden');
  $('playlistDetailTitle').textContent=p.name;$('playlistDetailDescription').textContent=p.description||'Your own collection of favorite tracks.';
  $('playlistDetailTracks').innerHTML=TRACKS.filter(t=>p.trackIds.includes(t.id)).map(t=>trackRow(t)).join('')||'<p class="subtle-label">This playlist is empty. Play a song and add it here.</p>';
  closeMobileMenu();window.scrollTo({top:0,behavior:'smooth'});
}
function playTrack(id, autoplay=true){
  const t=trackById(id);if(!t)return;
  currentTrackId=id;queueIndex=Math.max(0,queue.indexOf(id));
  if(!queue.includes(id)){queue.unshift(id);queueIndex=0;}
  if(audio.dataset.track!==id){audio.pause();audio.src=t.audio;audio.dataset.track=id;audio.load();}
  $('downloadBtn').disabled=!(t.downloadable && t.audio); $('downloadBtn').title=(t.downloadable?'Download this track':'Download unavailable for this stream');
  $('currentCover').src=t.cover;$('currentCover').alt=`${t.title} artwork`;$('currentTitle').textContent=t.title;$('currentArtist').textContent=t.artist;
  $('currentFavorite').classList.toggle('liked',favorites.has(id));$('currentFavorite').textContent=favorites.has(id)?'♥':'♡';
  $('playBtn').textContent=autoplay?'Ⅱ':'▶';$('playBtn').setAttribute('aria-label',autoplay?'Pause':'Play');
  $('miniVisualizer').classList.toggle('playing',autoplay);
  recent=[id,...recent.filter(x=>x!==id)].slice(0,8);writeStore('jb-recent',recent);
  renderTracks();renderQueue();
  if(autoplay){const promise=audio.play();if(promise&&promise.catch)promise.catch(()=>{ $('playBtn').textContent='▶';$('miniVisualizer').classList.remove('playing');showToast('Audio could not start. Check your connection or try another track.');});}
}
function togglePlay(){
  if(!currentTrackId){playTrack(queue[0]||TRACKS[0].id);return;}
  if(audio.paused){audio.play().then(()=>{$('playBtn').textContent='Ⅱ';$('playBtn').setAttribute('aria-label','Pause');$('miniVisualizer').classList.add('playing');}).catch(()=>showToast('Playback was blocked or the audio could not load.'));}else{audio.pause();$('playBtn').textContent='▶';$('playBtn').setAttribute('aria-label','Play');$('miniVisualizer').classList.remove('playing');}
}
function nextTrack(){
  if(!queue.length)return;
  let next;
  if(isShuffle){const choices=queue.filter(id=>id!==currentTrackId);next=choices[Math.floor(Math.random()*choices.length)]||currentTrackId;}
  else{let idx=queue.indexOf(currentTrackId);next=queue[(idx+1)%queue.length];}
  if(repeatMode===0&& !isShuffle && queue.indexOf(currentTrackId)===queue.length-1){audio.pause();audio.currentTime=0;$('playBtn').textContent='▶';$('miniVisualizer').classList.remove('playing');return;}
  playTrack(next);
}
function previousTrack(){if(audio.currentTime>3){audio.currentTime=0;return;}let idx=queue.indexOf(currentTrackId);playTrack(queue[(idx-1+queue.length)%queue.length]||TRACKS[0].id);}
function toggleFavorite(id){
  if(favorites.has(id))favorites.delete(id);else favorites.add(id);
  favorites=new Set(favorites);writeStore('jb-favorites',[...favorites]);$('favoriteCount').textContent=favorites.size;
  $('currentFavorite').classList.toggle('liked',favorites.has(currentTrackId));$('currentFavorite').textContent=favorites.has(currentTrackId)?'♥':'♡';
  renderTracks();if(activePlaylistId)openPlaylist(activePlaylistId);showToast(favorites.has(id)?'Added to favorites':'Removed from favorites');
}
function addToQueue(id){queue.push(id);renderQueue();showToast('Added to play queue');}
function openQueue(){ $('queuePanel').classList.add('open');$('queuePanel').setAttribute('aria-hidden','false');renderQueue(); }
function closeQueue(){ $('queuePanel').classList.remove('open');$('queuePanel').setAttribute('aria-hidden','true'); }
function setTheme(theme, persist=true){document.body.classList.toggle('light',theme==='light');$('themeToggle').textContent=theme==='light'?'☀':'☾';$('themeToggle').setAttribute('aria-label',theme==='light'?'Switch to dark theme':'Switch to light theme');if(persist)writeStore('jb-theme',theme);}
function closeMobileMenu(){$('sidebar').classList.remove('open');$('mobileScrim').classList.remove('show');}
function openCreatePlaylist(){ $('playlistName').value='';$('playlistDialog').showModal();setTimeout(()=>$('playlistName').focus(),50); }
function createPlaylist(name){
  const clean=name.trim();if(!clean)return;
  if(customPlaylists.some(p=>p.name.toLowerCase()===clean.toLowerCase())||PLAYLISTS.some(p=>p.name.toLowerCase()===clean.toLowerCase())){showToast('A playlist with that name already exists.');return;}
  const newPlaylist={id:'custom-'+Date.now(),name:clean,emoji:'♫',description:'Your personal playlist.',trackIds:currentTrackId?[currentTrackId]:[],cover:trackById(currentTrackId)?.cover||TRACKS[0].cover};
  customPlaylists.push(newPlaylist);writeStore('jb-playlists',customPlaylists);renderPlaylists();renderSidebarPlaylists();$('playlistDialog').close();showToast(`Created "${clean}"`);
}
function bindEvents(){
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('searchInput').addEventListener('input',()=>{if($('playlistDetailSection').classList.contains('hidden'))renderTracks();else{setView('library');renderTracks();} if(currentView==='discover')scheduleDiscovery($('searchInput').value.trim());});
  document.querySelectorAll('[data-discover-query]').forEach(b=>b.addEventListener('click',()=>{setView('discover');$('searchInput').value=b.dataset.discoverQuery;scheduleDiscovery(b.dataset.discoverQuery);}));
  $('searchInput').addEventListener('keydown',e=>{if(e.key==='Escape'){e.target.value='';renderTracks();e.target.blur();}});
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('searchInput').focus();}
    if(e.code==='Space'&&!['INPUT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName)&&!$('playlistDialog').open){e.preventDefault();togglePlay();}
    if(e.key==='Escape')closeQueue();
  });
  $('heroPlay').addEventListener('click',()=>playTrack(TRACKS[Math.floor(Math.random()*TRACKS.length)].id));
  $('playBtn').addEventListener('click',togglePlay);$('nextBtn').addEventListener('click',nextTrack);$('previousBtn').addEventListener('click',previousTrack);
  $('shuffleBtn').addEventListener('click',()=>{isShuffle=!isShuffle;$('shuffleBtn').classList.toggle('selected',isShuffle);showToast(isShuffle?'Shuffle enabled':'Shuffle disabled');});
  $('repeatBtn').addEventListener('click',()=>{repeatMode=(repeatMode+1)%3;$('repeatBtn').classList.toggle('selected',repeatMode>0);$('repeatBtn').textContent=repeatMode===2?'↻¹':'↻';showToast(['Repeat off','Repeat all','Repeat one'][repeatMode]);});
  $('progressBar').addEventListener('input',e=>{if(audio.duration)audio.currentTime=(Number(e.target.value)/1000)*audio.duration;});
  $('volumeBar').addEventListener('input',e=>{audio.volume=Number(e.target.value);audio.muted=audio.volume===0;previousVolume=audio.volume||previousVolume;$('muteBtn').textContent=audio.muted?'◖×':'◖))';e.target.style.setProperty('--fill',`${audio.volume*100}%`);});
  $('muteBtn').addEventListener('click',()=>{if(audio.muted||audio.volume===0){audio.muted=false;audio.volume=previousVolume||.75;$('volumeBar').value=audio.volume;}else{previousVolume=audio.volume;audio.muted=true;}$('muteBtn').textContent=audio.muted?'◖×':'◖))';$('volumeBar').style.setProperty('--fill',`${audio.muted?0:audio.volume*100}%`);});
  $('downloadBtn').addEventListener('click',downloadCurrentTrack);
  $('shareBtn').addEventListener('click',shareCurrentTrack);
  $('localAudioInput').addEventListener('change',e=>importLocalAudio(e.target.files));
  $('currentFavorite').addEventListener('click',()=>currentTrackId&&toggleFavorite(currentTrackId));
  $('themeToggle').addEventListener('click',()=>setTheme(document.body.classList.contains('light')?'dark':'light'));
  $('themeSide').addEventListener('click',()=>setTheme(document.body.classList.contains('light')?'dark':'light'));
  $('queueToggle').addEventListener('click',()=> $('queuePanel').classList.contains('open')?closeQueue():openQueue());
  $('queueToggleBottom').addEventListener('click',()=> $('queuePanel').classList.contains('open')?closeQueue():openQueue());$('closeQueue').addEventListener('click',closeQueue);
  $('menuToggle').addEventListener('click',()=>{$('sidebar').classList.add('open');$('mobileScrim').classList.add('show');});
  $('mobileScrim').addEventListener('click',closeMobileMenu);
  $('createPlaylistSide').addEventListener('click',openCreatePlaylist);
  $('playlistForm').addEventListener('submit',e=>{e.preventDefault();createPlaylist($('playlistName').value);});
  $('savePlaylistBtn').addEventListener('click',e=>{e.preventDefault();createPlaylist($('playlistName').value);});
  $('clearSearch').addEventListener('click',()=>{$('searchInput').value='';setView('discover');});
  $('addTracksBtn').addEventListener('click',()=>{const p=allPlaylists().find(x=>x.id===activePlaylistId);if(!p||!currentTrackId){showToast('Play a track first, then add it here.');return;}if(!p.trackIds.includes(currentTrackId)){p.trackIds.push(currentTrackId);if(p.id.startsWith('custom-'))writeStore('jb-playlists',customPlaylists);renderPlaylists();renderSidebarPlaylists();openPlaylist(p.id);showToast('Track added to playlist');}else showToast('That track is already in this playlist.');});
  document.body.addEventListener('click',e=>{
    const play=e.target.closest('[data-play-track]');if(play){playTrack(play.dataset.playTrack);return;}
    const extPlay=e.target.closest('[data-external-play]');if(extPlay){playTrack(extPlay.dataset.externalPlay);return;}
    const extAdd=e.target.closest('[data-external-add]');if(extAdd){const id=extAdd.dataset.externalAdd;if(!queue.includes(id))queue.push(id);renderQueue();showToast('Track added to queue');return;}
    const fav=e.target.closest('[data-favorite]');if(fav){toggleFavorite(fav.dataset.favorite);return;}
    const add=e.target.closest('[data-add-queue]');if(add){addToQueue(add.dataset.addQueue);return;}
    const pp=e.target.closest('[data-playlist-play]');if(pp){const p=allPlaylists().find(x=>x.id===pp.dataset.playlist);if(p?.trackIds.length){queue=[...p.trackIds];renderQueue();playTrack(queue[0]);}return;}
    const pl=e.target.closest('[data-playlist]');if(pl){openPlaylist(pl.dataset.playlist);return;}
    const qr=e.target.closest('[data-queue-track]');if(qr){playTrack(qr.dataset.queueTrack);return;}
  });
  document.body.addEventListener('keydown',e=>{const card=e.target.closest('.playlist-card');if(card&&(e.key==='Enter'||e.key===' ')){if(e.target===card){e.preventDefault();openPlaylist(card.dataset.playlist);}}});
  audio.addEventListener('loadedmetadata',()=>{const t=trackById(currentTrackId);if(t)t.duration=formatTime(audio.duration);$('duration').textContent=formatTime(audio.duration);renderTracks();renderQueue();});
  audio.addEventListener('timeupdate',()=>{if(!audio.duration)return;$('currentTime').textContent=formatTime(audio.currentTime);$('duration').textContent=formatTime(audio.duration);$('progressBar').value=Math.round(audio.currentTime/audio.duration*1000);$('progressBar').style.setProperty('--fill',`${audio.currentTime/audio.duration*100}%`);});
  audio.addEventListener('play',()=>{$('playBtn').textContent='Ⅱ';$('playBtn').setAttribute('aria-label','Pause');$('miniVisualizer').classList.add('playing');});
  audio.addEventListener('pause',()=>{$('playBtn').textContent='▶';$('playBtn').setAttribute('aria-label','Play');$('miniVisualizer').classList.remove('playing');});
  audio.addEventListener('ended',()=>{if(repeatMode===2){audio.currentTime=0;audio.play();}else if(repeatMode===1 || queue.indexOf(currentTrackId)!==queue.length-1 || isShuffle){nextTrack();}else{audio.pause();$('playBtn').textContent='▶';$('miniVisualizer').classList.remove('playing');}});
  audio.addEventListener('error',()=>{if(currentTrackId)showToast('This demo audio could not load. Check your connection or try another track.');});
}
function scheduleDiscovery(query){
  clearTimeout(discoverTimer);
  if(!query){$('discoverStatus').textContent='Choose a genre or search for a song or artist above.';$('discoverGrid').innerHTML='';return;}
  $('discoverStatus').textContent='Searching music catalogue…';
  discoverTimer=setTimeout(()=>searchDiscovery(query),450);
}
async function searchDiscovery(query){
  const request=++discoverRequest;
  try{
    const url=`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=18`;
    const response=await fetch(url);
    if(!response.ok)throw new Error('Catalogue request failed');
    const data=await response.json(); if(request!==discoverRequest)return;
    const results=(data.results||[]).filter(x=>x.previewUrl && x.trackName).map((x,i)=>({
      id:`itunes-${x.trackId||i}`,title:x.trackName,artist:x.artistName||'Unknown artist',album:x.collectionName||'Single',genre:x.primaryGenreName||'Music',
      cover:(x.artworkUrl100||'').replace('100x100bb','400x400bb'),audio:x.previewUrl,sourceUrl:x.trackViewUrl||x.collectionViewUrl||'https://music.apple.com/',duration:'',downloadable:false,source:'iTunes preview'
    }));
    results.forEach(t=>{const index=externalTracks.findIndex(old=>old.id===t.id);if(index>=0)externalTracks[index]=t;else externalTracks.push(t);});
    $('discoverStatus').textContent=results.length?`Found ${results.length} preview${results.length===1?'':'s'} for “${query}”. Select a track to listen.`:`No playable previews found for “${query}”. Try another search.`;
    $('discoverGrid').innerHTML=results.map(t=>`<article class="discover-card"><img src="${t.cover}" alt="" loading="lazy"><div class="discover-card-copy"><strong title="${safeText(t.title)}">${safeText(t.title)}</strong><span title="${safeText(t.artist)}">${safeText(t.artist)}</span><small>${safeText(t.genre)} · preview</small><div class="discover-card-actions"><button class="primary-btn" data-external-play="${t.id}">▶ Play preview</button><button class="icon-btn" data-external-add="${t.id}" aria-label="Add ${safeText(t.title)} to queue" title="Add to queue">＋</button><button class="icon-btn" data-share-external="${t.id}" aria-label="Share ${safeText(t.title)}" title="Share">↗</button></div></div></article>`).join('');
  }catch(error){if(request!==discoverRequest)return;$('discoverStatus').textContent='Music search is unavailable right now. Check your internet connection or try again later.';$('discoverGrid').innerHTML='';}
}
function downloadCurrentTrack(){
  const t=trackById(currentTrackId);if(!t){showToast('Choose a track first.');return;}
  if(!t.downloadable){showToast('This stream is preview-only or not marked for download.');return;}
  const link=document.createElement('a');link.href=t.audio;link.download=`${t.artist} - ${t.title}.mp3`;link.target='_blank';document.body.appendChild(link);link.click();link.remove();showToast('Download requested');
}
async function shareCurrentTrack(){
  const t=trackById(currentTrackId);if(!t){showToast('Choose a track first.');return;}
  const shareUrl=t.sourceUrl||location.href;
  const shareData={title:`${t.title} — ${t.artist}`,text:`Listen to ${t.title} by ${t.artist} on JiddaBeats`,url:shareUrl};
  try{if(navigator.share)await navigator.share(shareData);else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(`${shareData.text}: ${shareUrl}`);showToast('Track link copied to clipboard');}else{window.prompt('Copy this track link:',shareUrl);}}catch(error){if(error.name!=='AbortError')showToast('Sharing is not available in this browser.');}
}
function importLocalAudio(files){
  [...(files||[])].forEach(file=>{if(!file.type.startsWith('audio/'))return;const id=`local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;const track={id,title:file.name.replace(/\.[^.]+$/,''),artist:'Your device',album:'Local files',genre:'Local',cover:'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=85',audio:URL.createObjectURL(file),duration:'',downloadable:true,local:true};localTracks.push(track);queue.push(id);});
  renderQueue();renderTracks();$('discoverStatus').textContent=`Added ${files.length} file(s) from your device. Select them in Your library to play.`;showToast(`Added ${files.length} local audio file(s)`);
}
document.body.addEventListener('click',e=>{const share=e.target.closest('[data-share-external]');if(share){const t=trackById(share.dataset.shareExternal);if(t){currentTrackId=t.id;shareCurrentTrack();}}});
init();
