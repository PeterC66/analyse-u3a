const REPO_OWNER = 'peterc66';
const REPO_NAME = 'analyse-u3a';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

async function loadReleases() {
  const container = document.getElementById('releases-container');
  const versionSpan = document.getElementById('version');

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const release = await response.json();

    // Update version
    versionSpan.textContent = release.tag_name || 'Unknown';

    // Clear container
    container.innerHTML = '';

    // Get assets
    const assets = release.assets || [];
    const windows = assets.find(a => a.name.includes('.exe'));
    const macos = assets.filter(a => a.name.includes('.dmg') || a.name.endsWith('.zip'));

    // Render Windows
    if (windows) {
      container.appendChild(createReleaseCard(
        'Windows',
        windows.name,
        windows.browser_download_url,
        'windows'
      ));
    }

    // Render macOS
    if (macos.length > 0) {
      macos.forEach(asset => {
        container.appendChild(createReleaseCard(
          asset.name.includes('.dmg') ? 'macOS (Installer)' : 'macOS (Portable)',
          asset.name,
          asset.browser_download_url,
          'macos'
        ));
      });
    }

    // If no assets found, show message
    if (!windows && macos.length === 0) {
      container.innerHTML = `
        <div class="release-card">
          <h3>📦 No Downloads Available Yet</h3>
          <p>Check back soon for the latest release or visit <a href="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases" target="_blank">GitHub Releases</a>.</p>
        </div>
      `;
    }

  } catch (error) {
    console.error('Error loading releases:', error);
    container.innerHTML = `
      <div class="release-card">
        <h3>⚠️ Unable to Load Releases</h3>
        <p>Could not fetch the latest release. Please visit <a href="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases" target="_blank">GitHub Releases</a> directly.</p>
      </div>
    `;
  }
}

function createReleaseCard(label, filename, downloadUrl, platform) {
  const card = document.createElement('div');
  card.className = `release-card ${platform}`;

  const icon = platform === 'windows' ? '🪟' : '🍎';

  card.innerHTML = `
    <h3>${icon} ${label}</h3>
    <p class="filename">${filename}</p>
    <a href="${downloadUrl}" class="download-link">Download</a>
  `;

  return card;
}

async function loadMessage() {
  const messageText = document.getElementById('message-text');

  try {
    const response = await fetch('message.json');
    if (!response.ok) throw new Error('Could not load message');

    const data = await response.json();
    messageText.textContent = data.message;
  } catch (error) {
    console.error('Error loading message:', error);
    messageText.textContent = 'Stay tuned for updates on new releases and features.';
  }
}

// Load message and releases when page is ready
document.addEventListener('DOMContentLoaded', () => {
  loadMessage();
  loadReleases();
});
