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
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
}
async function initPostNav(){
  var nav = document.getElementById('postNav');
  if(!nav) return;
  try{
    var posts=null;
    var paths=['/posts.json','../posts.json','../../posts.json','posts.json','./posts.json','./../posts.json'];
    for(var i=0;i<paths.length;i++){
      try{
        var r = await fetch(paths[i]);
        if(r.ok){ posts = await r.json(); break; }
      }catch(e){}
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
