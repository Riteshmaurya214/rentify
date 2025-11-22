// Theme toggle
(function(){
  const toggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('rentify-theme');
  function applyTheme(t){
    if(t === 'dark'){
      root.classList.add('dark-mode');
      document.body.classList.add('bg-dark','text-light');
    } else {
      root.classList.remove('dark-mode');
      document.body.classList.remove('bg-dark','text-light');
    }
  }
  if(saved === 'dark') {
    if(toggle) toggle.checked = true;
    applyTheme('dark');
  }
  if(toggle){
    toggle.addEventListener('change', async function(){
      const theme = this.checked ? 'dark' : 'light';
      localStorage.setItem('rentify-theme', theme);
      applyTheme(theme);
    });
  }

  // mark read button
  const markBtn = document.getElementById('markReadBtn');
  if(markBtn){
    markBtn.addEventListener('click', async function(){
      markBtn.disabled = true;
      await fetch('/notifications/mark-read', { method: 'POST' });
      location.reload();
    });
  }
})();
