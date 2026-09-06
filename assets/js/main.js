function openMenu(){
  var nav=document.getElementById('header-nav');
  var hNav=document.getElementById('header-navigation');
  if(nav) nav.classList.add('menu-open');
  if(hNav) hNav.classList.add('menu-open-mobile');
  var openIcon=document.getElementById('openMenuIcon');
  var closeIcon=document.getElementById('closeMenuIcon');
  if(openIcon) openIcon.style.display='none';
  if(closeIcon) closeIcon.style.display='inline';
}
function closeMenu(){
  var nav=document.getElementById('header-nav');
  var hNav=document.getElementById('header-navigation');
  if(nav) nav.classList.remove('menu-open');
  if(hNav) hNav.classList.remove('menu-open-mobile');
  var openIcon=document.getElementById('openMenuIcon');
  var closeIcon=document.getElementById('closeMenuIcon');
  if(openIcon) openIcon.style.display='inline';
  if(closeIcon) closeIcon.style.display='none';
}
function toggleMenu(){
  var nav=document.getElementById('header-nav');
  if(nav && nav.classList.contains('menu-open')){ closeMenu(); } else { openMenu(); }
}
document.addEventListener('DOMContentLoaded',function(){
  var progress=document.getElementById('readProgress');
  var btt=document.getElementById('backToTop');
  window.addEventListener('scroll',function(){
    if(progress){
      var h=document.documentElement.scrollHeight - window.innerHeight;
      var sc=window.scrollY;
      var pct=h>0?(sc/h)*100:0;
      progress.style.width=pct+'%';
    }
    if(btt){
      if(window.scrollY>300) btt.classList.add('show'); else btt.classList.remove('show');
    }
  });
  if(btt) btt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
  initPostNav();
  initSearch();
});
async function initPostNav(){
  try{
    var isPostPage=window.location.pathname.includes('/posts/');
    var jsonPath=isPostPage?'../posts.json':'posts.json';
    var res=await fetch(jsonPath);
    if(!res.ok) return;
    var posts=await res.json();
    var postsArr=Array.isArray(posts)?posts:(posts.items||(posts.posts&&posts.posts.items)||[]);
    try{ postsArr.sort(function(a,b){ return new Date(b.date).getTime() - new Date(a.date).getTime(); }); }catch(e){}
    var labelsWidget=document.getElementById('labelsWidget');
    if(labelsWidget){
      var allLabels=[...new Set(postsArr.flatMap(function(p){return p.labels||[];}))].sort();
      if(allLabels.length){
        labelsWidget.innerHTML=allLabels.map(function(l){return '<a href="#" style="display:inline-block;background:var(--g50);border:1px solid var(--g100);padding:4px 12px;border-radius:20px;margin:4px;font-size:13px;">'+l+'</a>';}).join('');
      } else {
        labelsWidget.innerHTML='<p style="font-size:13px;color:#6b9a7d;">No labels yet</p>';
      }
    }
    var nav=document.getElementById('postNav');
    var titleEl=document.querySelector('.post-title');
    if(nav && titleEl && postsArr.length){
      var curTitle=titleEl.textContent.trim();
      var idx=postsArr.findIndex(function(p){return (p.title||'').trim()===curTitle;});
      if(idx===-1){
        var slugFromUrl=window.location.pathname.split('/').pop().replace('.html','');
        idx=postsArr.findIndex(function(p){return p.slug===slugFromUrl;});
      }
      if(idx!==-1){
        var prev=postsArr[idx-1];
        var next=postsArr[idx+1];
        var html='<div style="display:flex;justify-content:space-between;gap:12px;margin-top:22px;flex-wrap:wrap;">';
        if(prev) html+='<a href="'+(isPostPage?prev.slug+'.html':'posts/'+prev.slug+'.html')+'" style="background:var(--g700);color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;display:inline-block;">← '+prev.title+'</a>';
        else html+='<span></span>';
        if(next) html+='<a href="'+(isPostPage?next.slug+'.html':'posts/'+next.slug+'.html')+'" style="background:var(--g700);color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;display:inline-block;">'+next.title+' →</a>';
        html+='</div>';
        nav.innerHTML=html;
      }
    }
  }catch(e){ console.log('nav error',e); }
}
function initSearch(){
  var input=document.querySelector('#search-top-wrapper .gsc-input input');
  var button=document.querySelector('#search-top-wrapper .gsc-search-button input');
  if(!input) return;
  var doSearch=function(){
    var q=(input.value||'').toLowerCase().trim();
    var posts=document.querySelectorAll('.post-outer');
    if(posts.length>1 || window.location.pathname.endsWith('index.html') || window.location.pathname==='/' || window.location.pathname.endsWith('/') || document.querySelector('.blog-posts')){
      posts.forEach(function(p){
        var text=(p.textContent||'').toLowerCase();
        if(!q){ p.style.display=''; }
        else { p.style.display = text.includes(q) ? '' : 'none'; }
      });
    } else {
      if(q){
        var base=window.location.pathname.includes('/posts/') ? '../index.html' : 'index.html';
        window.location.href=base+'?q='+encodeURIComponent(q);
      }
    }
  };
  if(button) button.addEventListener('click', doSearch);
  input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); doSearch(); }});
  try{
    var params=new URLSearchParams(window.location.search);
    var qq=params.get('q');
    if(qq){
      input.value=qq;
      setTimeout(doSearch, 300);
    }
  }catch(e){}
}
