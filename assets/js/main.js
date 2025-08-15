
Reveal.initialize({ hash:true, controls:true, progress:true, center:true, transition:'fade' });

// Typed title
let typedStarted=false;
function startTyped(){
  if(typedStarted) return;
  typedStarted=true;
  new Typed('#typed-title',{ strings:['THOMAS FOR YOU'], typeSpeed:48, showCursor:false });
  new Typed('#typed-sub',{ strings:['based on a true story'], typeSpeed:38, startDelay:1400, showCursor:false });
}
Reveal.on('ready', e=>{ if(e.currentSlide && e.currentSlide.id==='title-slide') startTyped(); });
Reveal.on('slidechanged', e=>{ if(e.currentSlide && e.currentSlide.id==='title-slide') startTyped(); });

// Shuffle only random deck
(function(){
  const c=document.getElementById('random-deck'); if(!c) return;
  const s=Array.from(c.querySelectorAll(':scope > section.randomizable'));
  for(let i=s.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); c.insertBefore(s[j],s[i]); const t=s[i]; s[i]=s[j]; s[j]=t; }
})();

// Timer
(function(){
  const el=document.getElementById('timer'); let seconds=7*60;
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  el.textContent=fmt(seconds);
  const iv=setInterval(()=>{ seconds--; el.textContent=fmt(seconds); if(seconds<=60) el.classList.add('warn'); if(seconds<=0){ clearInterval(iv); el.textContent='00:00'; }},1000);
})();

// KB restart on title revisit
function restartKB(){ const kb=document.querySelector('#title-slide .kb-bg'); if(!kb) return; kb.style.animation='none'; void kb.offsetWidth; kb.style.animation=''; }
Reveal.on('slidechanged', e=>{ if(e.currentSlide && e.currentSlide.id==='title-slide') restartKB(); });

// THE PLAN typed description
let planTypedStarted=false;
function startPlanTyped(){ if(planTypedStarted) return; planTypedStarted=true;
  new Typed('#typed-plan-desc',{ strings:['Use my (nationally ranked) Speech and Debate skills to get through 7 minutes of randomly shuffled slides and impress everyone — or risk looking like a failure.'], typeSpeed:42, showCursor:true });
}
Reveal.on('slidechanged', e=>{ if(e.currentSlide && e.currentSlide.id==='plan-slide') startPlanTyped(); });

// Life Map (Leaflet) + auto tour
// Timeline (Plotly)
// Strava summary
(function initStrava(){
  const div=document.getElementById('strava-stats'); if(!div) return;
  fetch('data/strava_summary.json').then(r=>r.json()).then(d=>{
    const html=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      <div><h3>${(d.total_distance_km||0).toFixed(1)} km</h3><p>Total Distance</p></div>
      <div><h3>${(d.longest_ride_km||0).toFixed(1)} km</h3><p>Longest Ride</p></div>
      <div><h3>${(d.total_elev_m||0).toLocaleString()} m</h3><p>Total Elevation</p></div>
    </div>`;
    div.innerHTML=html;
  }).catch(()=>{ div.innerHTML="<em>Load your Strava data to show stats.</em>"; });
})();


// Auto-add Ken Burns class to all slide images (can be removed per image if needed)
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.reveal .slides img').forEach(img=>{
    if(!img.classList.contains('kenburns')) img.classList.add('kenburns');
  });
});


// ---- Preload data for map & timeline ----

// === INLINE DATA (no fetch, works from file://) ===
const _placesData = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Seattle, WA","note":"Rainy coding arc"},"geometry":{"type":"Point","coordinates":[-122.3321,47.6062]}},{"type":"Feature","properties":{"name":"Portland, OR","note":"PNW chapter"},"geometry":{"type":"Point","coordinates":[-122.6765,45.5231]}},{"type":"Feature","properties":{"name":"Tucson, AZ","note":"Desert detour"},"geometry":{"type":"Point","coordinates":[-110.9747,32.2226]}},{"type":"Feature","properties":{"name":"Minneapolis, MN","note":"Home base"},"geometry":{"type":"Point","coordinates":[-93.265,44.9778]}},{"type":"Feature","properties":{"name":"Rome, Italy","note":"Study abroad"},"geometry":{"type":"Point","coordinates":[12.4964,41.9028]}}]};
const _timelineData = [{"year":1990,"title":"Born in the 90s","description":"Origin story begins."},{"year":2003,"title":"Moved to Portland","description":"Family relocation to PDX."},{"year":2011,"title":"Back to Seattle","description":"Return to the Emerald City."},{"year":2015,"title":"Graduated","description":"Diploma acquired; next quest unlocked."},{"year":2018,"title":"Study Abroad — Rome","description":"Gelato-fueled academics."},{"year":2021,"title":"Moved to Minneapolis","description":"New base of operations."},{"year":2022,"title":"Master's — Arizona","description":"Desert degree achieved."},{"year":2025,"title":"Golden Birthday Epic Ride","description":"100 miles on a mountain bike + 5 miles of mud."}];

// === INLINE RIVALRY DATA ===
// Edit this array to add your duels. "link" can be a Strava segment/ride URL.
const _rivalryData = {
  rival: "Eric !",
  athlete: "Thomas",
  matches: [
    // EXAMPLES — replace with your own!
    { date:"2025-01-25", title:"2017 Cedar Lake Ice Capades", you_time:"2:06", rival_time:"2:02", winner:"Eric !", link:"https://www.strava.com/activities/12345", note:"Eric grabbed it back 😤 after trying 7 times" },
    { date:"2025-04-26", title:"Hands Free Zone", you_time:"0:45", rival_time:"0:45", winner:"Draw", link:"https://www.strava.com/activities/67890", note:"Had to defend my neighborhood Sopranos style" },
    { date:"2025-05-12", title:"hoping on beltline", you_time:"0:55", rival_time:"0:56", winner:"Me", link:"https://www.strava.com/activities/13579", note:"MF aint know what hit em" }
  ]
};

function buildRivalry(){
  const el = document.getElementById('rivalry');
  if(!el || !_rivalryData) return;
  if (el.dataset.built) return;

  const wins = _rivalryData.matches.filter(m=>m.winner==='you').length;
  const losses = _rivalryData.matches.filter(m=>m.winner==='rival').length;
  const draws = _rivalryData.matches.filter(m=>m.winner!=='you' && m.winner!=='rival').length;

  const header = `<div class="rivalry-header">
    <div class="stat"><div class="num">${wins}</div><div class="label">Wins</div></div>
    <div class="stat"><div class="num">${losses}</div><div class="label">Losses</div></div>
    <div class="stat"><div class="num">${draws}</div><div class="label">Draws</div></div>
  </div>`;

  const rows = _rivalryData.matches
    .sort((a,b)=>a.date.localeCompare(b.date))
    .map(m=>{
      const badge = m.winner==='you' ? '✅' : (m.winner==='rival' ? '🏴‍☠️' : '⚖️');
      const link = m.link ? `<a href="${m.link}" target="_blank">link</a>` : '';
      return `<tr>
        <td>${m.date}</td>
        <td>${badge} ${m.title}</td>
        <td>${m.you_time}</td>
        <td>${m.rival_time}</td>
        <td>${m.note||''}</td>
        <td>${link}</td>
      </tr>`;
    }).join("");

  el.innerHTML = header + `<table class="rivalry-table">
    <thead><tr><th>Date</th><th>Segment/Ride</th><th>You</th><th>${_rivalryData.rival}</th><th>Note</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  el.dataset.built = "1";
}

// ---- Map builder (only when slide is visible) ----
let _mapBuilt = false, _mapInstance = null, _mapTourInterval = null;
function buildMap(){
  if (_mapBuilt) {
    // ensure visibility sizing & keep touring
    setTimeout(()=>{ if(_mapInstance){ _mapInstance.invalidateSize(true); } }, 150);
    return;
  }
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;
  _mapInstance = L.map('map', { zoomControl: true, preferCanvas:true }).setView([44.9778,-93.2650], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(_mapInstance);
  if (_placesData){
    const layer = L.geoJSON(_placesData, { pointToLayer:(f,latlng)=> L.circleMarker(latlng,{radius:8, weight:2, fillOpacity:0.9}), onEachFeature:(f,l)=>{
      const p=f.properties||{}; l.bindPopup(`<b>${p.name||'Place'}</b><br>${p.note||''}`);
    }}).addTo(_mapInstance);
    setTimeout(()=>{ _mapInstance.invalidateSize(true); }, 50);
    // Fit to all points instead of auto-touring
    const bounds = layer.getBounds();
    if (bounds.isValid()) { _mapInstance.fitBounds(bounds.pad(0.25)); }
    // (Disabled auto-tour)
    /* let i=0; function flyNext(){ if(!coords.length) return; const c=coords[i%coords.length]; _mapInstance.flyTo(c, 6, {duration: 1.8}); i++; } */
  }
  _mapBuilt = true;
}

// ---- Timeline builder (only when slide is visible) ----
let _timelineBuilt = false;
function buildTimeline(){
  const div = document.getElementById('timeline');
  if (!div || !_timelineData) return;
  if (_timelineBuilt) {
    // Ensure sizing after becoming visible
    setTimeout(()=>{ try{ Plotly.Plots.resize(div); }catch(e){} }, 100);
    return;
  }
  const emojiFor = (t)=>{
    const s=t.toLowerCase();
    if(s.includes('born')) return '👶';
    if(s.includes('portland')) return '🌲';
    if(s.includes('seattle')) return '☔';
    if(s.includes('graduate')) return '🎓';
    if(s.includes('study abroad')||s.includes('rome')) return '🇮🇹';
    if(s.includes('minneapolis')) return '❄️';
    if(s.includes('master')) return '🎓';
    if(s.includes('ride')||s.includes('golden')) return '🚴‍♂️✨';
    return '⭐';
  };
  const years=_timelineData.map(d=>d.year);
  const titles=_timelineData.map(d=>d.title);
  const desc=_timelineData.map(d=>`${emojiFor(d.title)} ${d.description}`);
  const trace={ x:years, y:years.map(()=>1), mode:'markers+text', text:titles, textposition:'top center', hovertext:desc, hoverinfo:'text', marker:{ size:6, color:'#ffd34e', opacity:0.0 } };
  const layout={ paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)', xaxis:{ title:'Year', tickmode:'linear', dtick:1, color:'#e9eef7' }, yaxis:{ visible:false }, margin:{ l:10, r:10, t:20, b:40 }, showlegend:false, height:450, transition:{ duration:700, easing:'cubic-in-out' } };
  Plotly.newPlot(div,[trace],layout,{displayModeBar:false}).then(()=>{
    Plotly.animate(div, { data:[{ 'marker.size':14, 'marker.opacity':1.0 }] }, { transition:{ duration:700, easing:'cubic-in-out' }, frame:{ duration:700, redraw:false } });
    setTimeout(()=>{ try{ Plotly.Plots.resize(div); }catch(e){} }, 50);
  });
  _timelineBuilt = true;
}

// ---- Reveal hooks to build when slide shown ----
Reveal.on('slidechanged', e=>{
  const s = e.currentSlide;
  if (!s) return;
  if (s.querySelector && s.querySelector('#map')) buildMap();
  if (s.querySelector && s.querySelector('#timeline')) buildTimeline();
  if (s.querySelector && s.querySelector('#rivalry')) buildRivalry();

  if (s.querySelector && s.querySelector('#rivalry')) buildRivalry();

});
// Also trigger build if the first view lands directly on those slides
Reveal.on('ready', e=>{
  const s = e.currentSlide;
  if (!s) return;
  if (s.querySelector && s.querySelector('#map')) buildMap();
  if (s.querySelector && s.querySelector('#timeline')) buildTimeline();
  if (s.querySelector && s.querySelector('#rivalry')) buildRivalry();

  if (s.querySelector && s.querySelector('#rivalry')) buildRivalry();

});
