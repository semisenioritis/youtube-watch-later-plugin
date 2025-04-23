const endpoint = '###add the appscript endpoint here';

console.log('[AddToPlaylist] Content script loaded');

function createButton(videoUrl){
  console.log(`[AddToPlaylist] Creating button for: ${videoUrl}`);
  const btn = document.createElement('button');
  btn.innerText = '🕑';
  Object.assign(btn.style, {
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: '1000',
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    const videoLinks = document.querySelectorAll('a#thumbnail[href^="/watch"]');
    videoLinks.forEach(link => {
      const container = link.closest('ytd-thumbnail');
      if (container && !container.dataset.playlistButtonAdded) {
        const videoUrl = 'https://www.youtube.com' + link.getAttribute('href');
        const btn = createButton(videoUrl);        
  
        // Show the button on hover
        container.style.position = 'relative';
        container.appendChild(btn);
        btn.style.zIndex = '1000';
        container.onmouseover = () => {
          btn.style.display = 'block';
        };
        // container.onmouseout = (e) => {
        //   if (!container.contains(e.relatedTarget)) {
        //     btn.style.display = 'none';
        //   }
        // };
        
  
        container.dataset.playlistButtonAdded = 'true';
      }
    });
  }

const observer = new MutationObserver((mutations) => {
  console.log('[AddToPlaylist] DOM mutated');
  injectButtons();
});
observer.observe(document.body, { childList: true, subtree: true });

injectButtons();
