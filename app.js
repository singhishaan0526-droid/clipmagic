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
    const icons = { dark: '🌙', light: '☀️', vaporwave: '🌅' };
    showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`, icons[next] || '✨');
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
function showToast(message, icon = '✨', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);

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
    return data ? JSON.parse(data) : this.getDefaultProjects();
  },

  saveProjects(projects) {
    localStorage.setItem('cm-projects', JSON.stringify(projects));
  },

  /**
   * Adds a new project and optionally saves the first asset
   */
  async addProject(project, firstAssetFile = null) {
    const projects = this.getProjects();
    const projectId = 'proj-' + Date.now();

    // Default dynamic track structure
    const defaultProjectState = {
      tracks: [
        { id: 'track-v1', type: 'video', name: 'Video 1', clips: [] },
        { id: 'track-a1', type: 'audio', name: 'Audio 1', clips: [] }
      ]
    };

    const newProject = {
      id: projectId,
      name: project.name || 'Untitled Project',
      timestamp: new Date().toISOString(),
      status: project.status || 'draft',
      duration: project.duration || '0:00',
      size: project.size || '0 MB',
      thumbType: project.thumbType || Math.floor(Math.random() * 5) + 1,
      projectState: project.projectState || defaultProjectState,
      ...project,
      id: projectId // ensure id is preserved
    };

    if (firstAssetFile) {
      const assetId = 'asset-1'; // First asset
      await this.saveAsset(projectId, assetId, firstAssetFile);

      // Add the first clip to the first video track if it's a new project
      if (newProject.projectState.tracks[0]) {
        const isVideo = firstAssetFile.type.startsWith('video/');
        newProject.projectState.tracks[0].clips.push({
          id: 'clip-1',
          assetId: assetId,
          name: firstAssetFile.name,
          type: isVideo ? 'video' : 'image',
          start: 0,
          duration: isVideo ? 0 : 5, // Duration 0 for video means "not yet loaded meta", 5 for image
          trimStart: 0,
          trimEnd: isVideo ? 0 : 5,
          color: isVideo ? 'rgba(139, 92, 246, 0.35)' : 'rgba(251, 191, 36, 0.35)',
          borderColor: isVideo ? 'rgba(139, 92, 246, 0.6)' : 'rgba(251, 191, 36, 0.6)'
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
  },

  getDefaultProjects() {
    return [
      { id: 'proj-1', name: 'Product Launch Reel 2026', timestamp: '2026-02-26T18:00:00Z', status: 'done', duration: '2:34', size: '1.2 GB', thumbType: 1 },
      { id: 'proj-2', name: 'TikTok Weekly Vlog #14', timestamp: '2026-02-24T10:00:00Z', status: 'done', duration: '0:58', size: '450 MB', thumbType: 2 },
      { id: 'proj-3', name: 'Travel Montage — Japan 2026', timestamp: '2026-02-27T15:00:00Z', status: 'processing', duration: '4:12', size: '2.8 GB', thumbType: 3 }
    ];
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
