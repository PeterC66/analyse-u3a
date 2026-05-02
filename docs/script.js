const REPO_OWNER = 'peterc66';
const REPO_NAME = 'analyse-u3a';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const FALLBACK_MESSAGE = 'Stay tuned for updates on new releases and features.';

async function fetchMessageTemplate() {
  try {
    const response = await fetch('message.json');
    if (!response.ok) throw new Error('Could not load message');
    const data = await response.json();
    return typeof data.message === 'string' ? data.message : null;
  } catch (error) {
    console.error('Error loading message:', error);
    return null;
  }
}

async function fetchLatestRelease() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading releases:', error);
    return null;
  }
}

function renderMessage(template, version) {
  const messageText = document.getElementById('message-text');
  if (template === null) {
    messageText.textContent = FALLBACK_MESSAGE;
    return;
  }
  if (template.includes('{version}') && !version) {
    messageText.textContent = FALLBACK_MESSAGE;
    return;
  }
  messageText.textContent = template.replace(/\{version\}/g, version ?? '');
}

function renderReleases(release) {
  const container = document.getElementById('releases-container');
  const versionSpan = document.getElementById('version');

  if (!release) {
    versionSpan.textContent = 'Unavailable';
    container.innerHTML = `
      <div class="release-card">
        <h3>⚠️ Unable to Load Releases</h3>
        <p>Could not fetch the latest release. Please visit <a href="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases" target="_blank">GitHub Releases</a> directly.</p>
      </div>
    `;
    return;
  }

  versionSpan.textContent = release.tag_name || 'Unknown';
  container.innerHTML = '';

  const assets = release.assets || [];
  const windows = assets.find(a => a.name.includes('.exe'));
  const macos = assets.filter(a => a.name.includes('.dmg') || a.name.endsWith('.zip'));

  if (windows) {
    container.appendChild(createReleaseCard(
      'Windows',
      windows.name,
      windows.browser_download_url,
      'windows'
    ));
  }

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

  if (!windows && macos.length === 0) {
    container.innerHTML = `
      <div class="release-card">
        <h3>📦 No Downloads Available Yet</h3>
        <p>Check back soon for the latest release or visit <a href="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases" target="_blank">GitHub Releases</a>.</p>
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

document.addEventListener('DOMContentLoaded', async () => {
  const [template, release] = await Promise.all([
    fetchMessageTemplate(),
    fetchLatestRelease(),
  ]);
  renderMessage(template, release?.tag_name);
  renderReleases(release);
});
