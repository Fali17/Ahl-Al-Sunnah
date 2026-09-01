document.addEventListener('click', function(e){
  if(e.target.matches('#header-nav a')) {
    var nav = document.getElementById('header-nav');
    var t = document.getElementById('navToggle');
    if(nav) nav.classList.remove('open');
    if(t){ t.setAttribute('aria-expanded','false'); t.innerHTML='☰'; }
  }
});
