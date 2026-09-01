// Core site JS: keeps existing utilities and adds a lightweight Blog module
function openMenu(){
  var nav = document.getElementById('header-nav');
  if(nav) nav.classList.toggle('open');
}
function closeMenu(){
  var nav = document.getElementById('header-nav');
  if(nav) nav.classList.remove('open');
}
(function(){
  var rp = document.getElementById('readProgress');
  if(rp){
    window.addEventListener('scroll', function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h>0 ? (window.scrollY/h)*100 : 0;
      rp.style.width = p + '%';
    });
  }
  var btt = document.getElementById('backToTop');
  if(btt){
    window.addEventListener('scroll', function(){
      if(window.scrollY>320) btt.classList.add('show'); else btt.classList.remove('show');
    });
    btt.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  }
})();
function slugify(s){
  if(!s) return '';
  return s.toString().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
}
async function initPostNav(){
  var nav = document.getElementById('postNav');
  if(!nav) return;
  try{
    var posts=null;
    var paths=['/posts.json','../posts.json','../../posts.json','posts.json','./posts.json','./../posts.json'];
    for(var i=0;i<paths.length;i++){
      try{ var r = await fetch(paths[i]); if(r.ok){ posts = await r.json(); break; } }catch(e){}
    }
    if(!posts || !posts.length) return;
    var cur = location.pathname.split('/').pop().replace('.html','');
    var idx = -1;
    for(var j=0;j<posts.length;j++){
      var p=posts[j];
      var pu = (p.url||'').toLowerCase();
      if(pu.indexOf(cur.toLowerCase())!==-1 || (p.slug && p.slug===cur) || (p.id && String(p.id)===cur) || slugify(p.title)===cur){ idx=j; break; }
    }
    if(idx===-1 && posts.length){ return; }
    var html='';
    if(idx>0){
      var prev=posts[idx-1];
      var prevUrl = prev.url || ('../posts/'+ (prev.slug || slugify(prev.title) || prev.id) + '.html');
      if(location.pathname.indexOf('/posts/')!==-1) prevUrl = (prev.slug||slugify(prev.title)||prev.id)+'.html';
      html+='<a href="'+prevUrl+'" class="prev">← '+prev.title+'</a>';
    }
    if(idx>=0 && idx<posts.length-1){
      var next=posts[idx+1];
      var nextUrl = next.url || ('../posts/'+ (next.slug || slugify(next.title) || next.id) + '.html');
      if(location.pathname.indexOf('/posts/')!==-1) nextUrl = (next.slug||slugify(next.title)||next.id)+'.html';
      html+='<a href="'+nextUrl+'" class="next">'+next.title+' →</a>';
    }
    nav.innerHTML=html;
  }catch(e){ console.log(e); }
}
document.addEventListener('DOMContentLoaded', initPostNav);

// Lightweight Blog UI module for search + pagination + labels + responsive nav
window.Blog = (function(){
  let state = { posts: [], filtered: [], page: 0, perPage: 10 };
  let ids = {};

  function q(id){ return document.getElementById(id); }

  async function loadPosts(path){
    const res = await fetch(path);
    if(!res.ok) throw new Error('Failed loading posts.json');
    const data = await res.json();
    return data;
  }

  function renderPostCard(p){
    const date = p.date ? '<div class="meta">'+p.date+'</div>' : '';
    const snippet = (p.snippet||'').replace(/"/g, '&quot;');
    const url = 'posts/'+(p.slug||p.id)+'.html';
    return '<div class="post-outer">'+
           '<h3 class="post-title"><a href="'+url+'">'+(p.title||'Untitled')+'</a></h3>'+date+
           '<div class="post-body">'+snippet+'</div>'+
           '<a class="read-more" href="'+url+'">Read more</a>'+
           '</div>';
  }

  function renderList(){
    const out = q(ids.postsList);
    if(!out) return;
    const start = state.page * state.perPage;
    const pageItems = state.filtered.slice(start, start + state.perPage);
    if(pageItems.length===0){ out.innerHTML = '<div class="post-outer"><p>No posts found.</p></div>'; return; }
    out.innerHTML = pageItems.map(renderPostCard).join('');
    renderPagination();
  }

  function renderPagination(){
    const pc = q(ids.pagination);
    if(!pc) return;
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    const prevDisabled = state.page <= 0;
    const nextDisabled = state.page >= pages-1;
    pc.innerHTML = '';
    const prev = document.createElement('button'); prev.className='pager-btn'; prev.textContent='← Previous'; prev.disabled=prevDisabled;
    prev.addEventListener('click', ()=>{ if(!prev.disabled){ state.page--; renderList(); window.scrollTo({top:150, behavior:'smooth'}); } });
    const next = document.createElement('button'); next.className='pager-btn'; next.textContent='Next →'; next.disabled=nextDisabled;
    next.addEventListener('click', ()=>{ if(!next.disabled){ state.page++; renderList(); window.scrollTo({top:150, behavior:'smooth'}); } });
    const info = document.createElement('div'); info.className='pager-info'; info.textContent = 'Page '+(state.page+1)+' of '+pages;
    pc.appendChild(prev); pc.appendChild(info); pc.appendChild(next);
  }

  function buildLabels(){
    const el = q(ids.labelCloud);
    if(!el) return;
    const map = {};
    state.posts.forEach(p => (p.labels||[]).forEach(l => { map[l] = (map[l]||0) + 1; }));
    const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,20);
    el.innerHTML = entries.map(([l,c])=> '<span class="label-pill" data-label="'+l+'">'+l+' ('+c+')</span>').join('');
    el.querySelectorAll('.label-pill').forEach(n=> n.addEventListener('click', ()=>{ applyLabelFilter(n.dataset.label); }));
  }

  function applyLabelFilter(label){
    state.filtered = state.posts.filter(p => (p.labels||[]).includes(label));
    state.page = 0;
    renderList();
    window.scrollTo({top:120, behavior:'smooth'});
  }

  function doSearch(qs){
    const ql = qs.trim().toLowerCase();
    if(!ql){ state.filtered = state.posts.slice(); state.page=0; renderList(); return; }
    state.filtered = state.posts.filter(p => {
      return (p.title||'').toLowerCase().includes(ql) || (p.snippet||'').toLowerCase().includes(ql) || (p.body||'').toLowerCase().includes(ql) || ((p.labels||[]).join(' ').toLowerCase().includes(ql));
    });
    state.page = 0;
    renderList();
  }

  function wireNavToggle(){
    const t = q(ids.navToggle); const nav = q(ids.nav);
    if(!t||!nav) return;
    t.addEventListener('click', function(){
      const open = nav.classList.toggle('open');
      t.setAttribute('aria-expanded', open?'true':'false');
    });
    // close nav on outside click on small screens
    document.addEventListener('click', function(e){ if(!nav.contains(e.target) && !t.contains(e.target)) nav.classList.remove('open'); });
  }

  async function init(opts){
    ids.postsList = opts.postsListId || 'postsList';
    ids.labelCloud = opts.labelCloudId || 'labelCloud';
    ids.pagination = opts.paginationId || 'paginationControls';
    ids.search = opts.searchInputId || 'searchBox';
    ids.clearSearch = opts.clearSearchId || 'clearSearch';
    ids.navToggle = opts.navToggleId || 'navToggle';
    ids.nav = opts.navId || 'header-nav';
    state.perPage = opts.postsPerPage || 10;

    try{
      const posts = await loadPosts(opts.postsPath || './posts.json');
      state.posts = posts;
      state.filtered = posts.slice();
      renderList(); buildLabels();
    }catch(e){ console.error('Blog.init error', e); }

    // wire search
    const s = q(ids.search);
    if(s){ s.addEventListener('input', function(e){ doSearch(e.target.value); }); }
    const c = q(ids.clearSearch);
    if(c&&s){ c.addEventListener('click', function(){ s.value=''; s.focus(); doSearch(''); }); }

    wireNavToggle();
  }

  return { init };
})();

/* ===== Nav toggle fallback for pages that don't initialize Blog.init ===== */
document.addEventListener('DOMContentLoaded', function () {
  var t = document.getElementById('navToggle');
  var nav = document.getElementById('header-nav');
  if (t && nav) {
    // ensure the button toggles the nav open class
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close nav on outside click (mobile)
    document.addEventListener('click', function (ev) {
      if (!nav.contains(ev.target) && !t.contains(ev.target)) {
        nav.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
