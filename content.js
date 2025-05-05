const endpoint = '###add the appscript endpoint here';

console.log('[AddToPlaylist] Content script loaded');



let lastUrl=location.href;

;(() => {
  const wrap = fn => function(...args) {
    const ret = fn.apply(this, args);
    window.dispatchEvent(new Event('yt-navigate'));
    return ret;
  }
  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);
  window.addEventListener('popstate', () => window.dispatchEvent(new Event('yt-navigate')));
})();


const style = document.createElement('style');
style.textContent = `
@keyframes pulseHighlight {
  0% {
    background-color: rgba(255, 0, 0, 0.2);
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    background-color: rgba(255, 0, 0, 0.5);
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  }
  100% {
    background-color: rgba(255, 0, 0, 0.2);
    transform: scale(1);
    box-shadow: none;
  }
}
.playlist-player-button.pulse {
  animation: pulseHighlight 1.2s ease-in-out;
}
`;
document.head.appendChild(style);




function createButton(videoUrl){
  console.log(`[AddToPlaylist] Creating button for: ${videoUrl}`);
  const btn = document.createElement('button');
  btn.innerText = '🕑';
  btn.setAttribute('aria-label','Add to Watch Later');
  Object.assign(btn.style, {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    zIndex: '1000',
    backgroundColor: 'rgba(0,0,0,0.7)',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    color: 'white',
    border: 'none',
    padding: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    borderRadius: '4px'
  });
  btn.style.display = 'none';

  btn.onclick = async (e) => {
    e.stopPropagation();
    console.log(`[AddToPlaylist] Button clicked for ${videoUrl}`);
    btn.disabled = true;
    btn.innerText = 'Adding...';
  
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        redirect: "follow",
        headers: { 'Content-Type': "text/plain;charset=utf-8" },
        body: JSON.stringify({ url: videoUrl })
      });
      const result = await res.json();
      console.log('[AddToPlaylist] Response:', result);
  
      if (result.added) {
        btn.innerText = '✓ Added';
        btn.style.backgroundColor = 'green';
        showToast(`"${result.title}" added to playlist!`);
      } else {
        btn.innerText = '✗ Error';
        btn.title = result.error || 'Unknown error';
        btn.style.backgroundColor = 'red';
        showToast(`Failed to add video. Error: ${result.error}`);
      }
    } catch (err) {
      console.error('[AddToPlaylist] Fetch failed:', err);
      btn.innerText = '✗ Failed';
      btn.title = err.message;
      btn.style.backgroundColor = 'red';
      showToast(`Failed to add video. Error: ${result.error}`);
    }
  };
  

  return btn;
}


function showToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '20px';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px';
    toast.style.borderRadius = '5px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';
  
    document.body.appendChild(toast);
  
    // Show toast with fade-in effect
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 0);
  
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

function injectButtons() {
    const videoLinks = document.querySelectorAll('ytd-thumbnail a[href^="/watch"]');
    videoLinks.forEach(link => {
      const container = link.closest('ytd-rich-grid-media, ytd-grid-video-renderer');
      
      if (container && !container.dataset.playlistButtonAdded) {
        const videoUrl = 'https://www.youtube.com' + link.getAttribute('href');
        const btn = createButton(videoUrl);        
  
        // Show the button on hover
        container.style.position = 'relative';
        container.appendChild(btn);
        btn.style.zIndex = '1000';
        container.addEventListener('pointerenter', () => {
          btn.style.display = 'block';
          

        });
        container.addEventListener('pointerleave', () => {
          btn.style.display = 'none';
        });
        
  
        container.dataset.playlistButtonAdded = 'true';
      }
    });
  }

  function injectSuggestedButtons(){
    document
      .querySelectorAll('yt-lockup-view-model a[href^="/watch"]')
      .forEach(link=>{
        const container = link.closest('yt-lockup-view-model');
        if (!container || container.dataset.playlistSugButton) return;
        const url = 'https://www.youtube.com'+link.getAttribute('href');
        const btn = createButton(url);
        container.style.position='relative';
        container.appendChild(btn);
        container.addEventListener('pointerenter',()=>btn.style.display='block');
        container.addEventListener('pointerleave',()=>btn.style.display='none');
        container.dataset.playlistSugButton='true';
      });
  }


  function injectPlayerButton(){
    const container = document.querySelector('.html5-video-player');
    if (!container || container.dataset.playlistPlayerButton) return;
    const videoUrl = window.location.href;
    const btn = createButton(videoUrl);
    btn.classList.add('playlist-player-button');
    Object.assign(btn.style, {
      top: '8px',
      right: 'auto',
      bottom: 'auto',
      left: '10px',
      fontSize: '18px',
      padding: '8px 12px',
      backgroundColor: 'rgba(0,0,0,0.7)',
    });
    btn.style.display = 'block';
    container.style.position = 'relative';
    container.appendChild(btn);
    container.dataset.playlistPlayerButton = 'true';
  }
  
  

  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log('[AddToPlaylist] URL changed, clearing old buttons');
      document.querySelectorAll('[data-playlist-button-added],[data-playlist-sug-button],[data-playlist-player-button]')
        .forEach(el => {
          el.querySelector('button[aria-label="Add to Watch Later"]')?.remove();
          delete el.dataset.playlistButtonAdded;
          delete el.dataset.playlistSugButton;
          delete el.dataset.playlistPlayerButton;
        });
    }
    injectButtons();
    injectSuggestedButtons();
    injectPlayerButton();
  });
  
observer.observe(document.body, { childList: true, subtree: true });

injectButtons();
injectSuggestedButtons();
injectPlayerButton(); 

function pulseRandomly() {
  const delay = 10000 + Math.random() * 8000; // 10s to 18s
  setTimeout(() => {
    const btn = document.querySelector('.playlist-player-button');
    if (btn) {
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 1200); // match animation duration
    }
    pulseRandomly(); // recurse
  }, delay);
}
pulseRandomly();

