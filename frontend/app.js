// ============================================
// CLIP MAGIC — Shared JavaScript utilities
// ============================================

// === Theme Toggle (runs immediately to avoid flash) ===
(function () {
  const saved = localStorage.getItem('cm-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  let next = 'dark';
  if (current === 'dark') next = 'light';
  else if (current === 'light') next = 'vaporwave';
  else next = 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('cm-theme', next);

  if (typeof showToast === 'function') {
    const icons = { dark: '<i data-lucide="moon" style="width:18px; height:18px;"></i>', light: '<i data-lucide="sun" style="width:18px; height:18px;"></i>', vaporwave: '🌅' };
    showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`, icons[next] || '<i data-lucide="sparkles" style="width:18px; height:18px;"></i>');
  }
}

// === Navbar scroll effect ===
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
});

// === Active nav link ===
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
});

// === Toast notification ===
function showToast(message, icon = '<i data-lucide="sparkles" style="width:18px; height:18px;"></i>', type = 'info', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  // H2 FIX: message via textContent, not innerHTML — blocks XSS
  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast-icon';
  iconSpan.innerHTML = icon; // safe: always our own SVG/emoji constant
  const msgSpan = document.createElement('span');
  msgSpan.textContent = String(message);
  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);
  document.body.appendChild(toast);
  if (window.lucide) window.lucide.createIcons({ root: toast });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// === Intersection Observer for scroll animations ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// === Counter animation ===
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = target / 60;
  const update = () => {
    current += step;
    if (current >= target) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    el.textContent = Math.floor(current).toLocaleString() + suffix;
    requestAnimationFrame(update);
  };
  update();
}

// === Project Service (Persistent State & Multi-Asset File Storage) ===
const ProjectService = {
  dbPromise: null,

  getDB() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('ClipMagicDB', 2); // Bump version for new stores
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets');
        }
        // Legacy 'files' store cleanup if exists
        if (db.objectStoreNames.contains('files')) {
          db.deleteObjectStore('files');
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
    return this.dbPromise;
  },

  /**
   * Saves a file asset to IndexedDB
   * @param {string} projectId 
   * @param {string} assetId 
   * @param {File|Blob} file 
   */
  async saveAsset(projectId, assetId, file) {
    const db = await this.getDB();
    const key = `${projectId}:${assetId}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readwrite');
      const store = tx.objectStore('assets');
      const request = store.put(file, key);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error("IndexedDB Save Error:", request.error);
        reject(new Error(`Save error: ${request.error.name}. your phone might be low on space.`));
      };
    });
  },

  /**
   * Retrieves a file asset from IndexedDB
   * @param {string} projectId 
   * @param {string} assetId 
   */
  async getAsset(projectId, assetId) {
    const db = await this.getDB();
    const key = `${projectId}:${assetId}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readonly');
      const store = tx.objectStore('assets');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error("IndexedDB Get Error:", request.error);
        reject(new Error(`Load error: ${request.error.name}`));
      };
    });
  },

  async deleteProjectAssets(projectId) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readwrite');
      const store = tx.objectStore('assets');
      const range = IDBKeyRange.bound(`${projectId}:`, `${projectId}:\uffff`);
      const request = store.delete(range);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error("IndexedDB Delete Error:", request.error);
        reject(new Error(`Delete error: ${request.error.name}`));
      };
    });
  },

  getProjects() {
    const data = localStorage.getItem('cm-projects');
    if (!data) return this.getDefaultProjects();
    // M4 FIX: safe JSON parse — corrupted data resets instead of crashing every page
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) throw new Error('expected array');
      return parsed;
    } catch (e) {
      console.warn('[ProjectService] Corrupted cm-projects — resetting.', e);
      localStorage.removeItem('cm-projects');
      return this.getDefaultProjects();
    }
  },

  saveProjects(projects) {
    localStorage.setItem('cm-projects', JSON.stringify(projects));
  },

  /**
   * Adds a new project and optionally saves assets
   * @param {Object} project 
   * @param {Object|File} assets - Can be a File (legacy) or an object { video: File, music: File }
   */
  async addProject(project, assets = null) {
    const projects = this.getProjects();
    const projectId = 'proj-' + Date.now();

    // Normalize assets
    let assetFiles = {};
    if (assets instanceof File) {
      assetFiles.video = assets;
    } else if (assets && typeof assets === 'object') {
      assetFiles = assets;
    }

    // Default dynamic track structure
    const defaultProjectState = {
      tracks: [
        { id: 'track-v1', type: 'video', name: 'Video 1', clips: [] },
        { id: 'track-a1', type: 'audio', name: 'Audio 1', clips: [] }
      ]
    };

    // M4 FIX: explicit field pick — no unsafe spread from untrusted project object
    const ALLOWED_STATUSES = new Set(['draft', 'processing', 'done']);
    const newProject = {
      id: projectId,
      name: typeof project.name === 'string' ? project.name.slice(0, 200) : 'Untitled Project',
      timestamp: new Date().toISOString(),
      status: ALLOWED_STATUSES.has(project.status) ? project.status : 'draft',
      duration: typeof project.duration === 'string' ? project.duration.slice(0, 20) : '0:00',
      size: typeof project.size === 'string' ? project.size.slice(0, 20) : '0 MB',
      thumbType: Number.isInteger(project.thumbType) && project.thumbType >= 1 && project.thumbType <= 5
        ? project.thumbType
        : Math.floor(Math.random() * 5) + 1,
      projectState: project.projectState || defaultProjectState,
    };

    // Save video asset
    if (assetFiles.video) {
      const assetId = 'asset-video';
      await this.saveAsset(projectId, assetId, assetFiles.video);

      // Add to first video track
      const videoTrack = newProject.projectState.tracks.find(t => t.type === 'video');
      if (videoTrack) {
        videoTrack.clips.push({
          id: 'clip-v1',
          assetId: assetId,
          name: assetFiles.video.name,
          type: 'video',
          start: 0,
          duration: 0,
          trimStart: 0,
          trimEnd: 0,
          color: 'rgba(139, 92, 246, 0.35)',
          borderColor: 'rgba(139, 92, 246, 0.6)'
        });
      }
    }

    // Save music asset
    if (assetFiles.music) {
      const assetId = 'asset-music';
      await this.saveAsset(projectId, assetId, assetFiles.music);

      // Add to first audio track
      const audioTrack = newProject.projectState.tracks.find(t => t.type === 'audio');
      if (audioTrack) {
        audioTrack.clips.push({
          id: 'clip-a1',
          assetId: assetId,
          name: assetFiles.music.name,
          type: 'music',
          start: 0,
          duration: 0,
          trimStart: 0,
          trimEnd: 0,
          color: 'rgba(236, 72, 153, 0.35)',
          borderColor: 'rgba(236, 72, 153, 0.6)'
        });
      }
    }

    projects.unshift(newProject);
    this.saveProjects(projects);
    return newProject;
  },

  getProject(id) {
    return this.getProjects().find(p => p.id === id);
  },

  updateProject(id, updates) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...updates };
      this.saveProjects(projects);
    }
  },

  async deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.saveProjects(projects);
    await this.deleteProjectAssets(id);
    AssetManager.revokeProject(id);
  },

  /**
   * Specifically for adding an asset to an existing project
   */
  async addProjectAsset(projectId, assetId, file) {
    await this.saveAsset(projectId, assetId, file);
    return assetId;
  },

  getDefaultProjects() {
    return [
      { id: 'proj-1', name: 'Product Launch Reel 2026', timestamp: '2026-02-26T18:00:00Z', status: 'done', duration: '2:34', size: '1.2 GB', thumbType: 1 },
      { id: 'proj-2', name: 'TikTok Weekly Vlog #14', timestamp: '2026-02-24T10:00:00Z', status: 'done', duration: '0:58', size: '450 MB', thumbType: 2 },
      { id: 'proj-3', name: 'Travel Montage — Japan 2026', timestamp: '2026-02-27T15:00:00Z', status: 'processing', duration: '4:12', size: '2.8 GB', thumbType: 3 }
    ];
  }
};

// === Asset Manager (Blob URL Cache) ===
const AssetManager = {
  urlCache: new Map(),

  async getUrl(projectId, assetId) {
    const key = `${projectId}:${assetId}`;
    if (this.urlCache.has(key)) return this.urlCache.get(key);

    const file = await ProjectService.getAsset(projectId, assetId);
    if (!file) return null;

    const url = URL.createObjectURL(file);
    this.urlCache.set(key, url);
    return url;
  },

  revokeUrl(projectId, assetId) {
    const key = `${projectId}:${assetId}`;
    if (this.urlCache.has(key)) {
      URL.revokeObjectURL(this.urlCache.get(key));
      this.urlCache.delete(key);
    }
  },

  clearCache() {
    this.urlCache.forEach(url => URL.revokeObjectURL(url));
    this.urlCache.clear();
  },

  revokeProject(projectId) {
    const prefix = `${projectId}:`;
    for (const [key, url] of this.urlCache) {
      if (key.startsWith(prefix)) {
        URL.revokeObjectURL(url);
        this.urlCache.delete(key);
      }
    }
  }
};


// === Smooth page transitions ===
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '1';
  }, 50);
});
