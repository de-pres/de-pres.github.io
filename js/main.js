// js/main.js

// Utility: slug aus URL holen
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

// Generische Funktion zum Laden von JSON (Index- oder Einzeldatei)
async function loadIndex(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

// Erzeugt eine anklickbare, längliche Karte für die Startseite
function createLongCard(item) {
  const a = document.createElement('a');
  a.href = `archive.html?slug=${item.slug}`;
  a.className = 'card long';
  a.innerHTML = `
    <img src="public/images/${item.image}" alt="${item.title}">
    <div class="card-content">
      <h3 class="card-title">${item.title}</h3>
      <p class="card-author">${item.author}</p>
    </div>
  `;
  return a;
}

// Rendert die Startseite mit allen Stories
async function renderIndex() {
  const items = await loadIndex('/content/stories/stories.json');
  const container = document.querySelector('.cards-container');
  items.forEach(item => container.appendChild(createLongCard(item)));
}

// Archiv-Liste für Stories
async function renderArchiveList() {
  const items = await loadIndex('/content/stories/stories.json');
  const ul = document.getElementById('stories-list');
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.title}</strong> von ${item.author}
      [<a href="archive.html?slug=${item.slug}">Ansehen</a>]
      [<a href="/content/stories/${item.slug}.json" download>JSON</a>]
      [<a href="public/audio/${item.audio}" download>Audio</a>]
    `;
    ul.appendChild(li);
  });
}

// Rendert Detailseiten: Stories, Biografien, Materialien
async function renderDetail(type) {
  const slug = getSlug();
  if (!slug) return;
  const data = await loadIndex(`/content/${type}/${type}.json`);
  const item = data.find(i => i.slug === slug);
  const container = document.getElementById(`${type}-detail`);
  if (!item) {
    container.textContent = `${type} nicht gefunden.`;
    return;
  }
  let media = '';
  if (type === 'stories') {
    media = `
      <audio id="audio-player" controls src="public/audio/${item.audio}"></audio>
      <button id="download-audio" class="btn">Audio herunterladen</button>
      <button id="export-pdf" class="btn">Als PDF speichern</button>
    `;
  }
  if (type === 'materials') {
    media = item.file
      ? `<a href="public/materials/${item.file}" download class="btn">Download Material</a>`
      : '';
  }
  container.innerHTML = `
    <h1>${item.title || item.name}</h1>
    <img src="public/images/${item.image}" class="detail-thumb" alt="${item.title || item.name}">
    <p class="detail-author">${item.author || item.name}</p>
    ${media}
    <div class="text-content">${item.text || item.bio || item.description}</div>
  `;
  if (type === 'stories') {
    document.getElementById('download-audio').onclick = () => {
      const a = document.createElement('a');
      a.href = `public/audio/${item.audio}`;
      a.download = item.audio;
      a.click();
    };
    document.getElementById('export-pdf').onclick = () => {
      import('jspdf').then(({ jsPDF }) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(item.title, 10, 20);
        doc.setFontSize(12);
        doc.text(`von ${item.author}`, 10, 30);
        doc.text(item.text, 10, 40, { maxWidth: 190 });
        doc.save(`${item.slug}.pdf`);
      });
    };
  }
}

// Archiv-Liste für Biografien
async function renderBiosList() {
  const items = await loadIndex('/content/bios/bios.json');
  const ul = document.getElementById('bios-list');
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.name}</strong>
      [<a href="biografie.html?slug=${item.slug}">Ansehen</a>]
      [<a href="/content/bios/${item.slug}.json" download>JSON</a>]
    `;
    ul.appendChild(li);
  });
}

// Archiv-Liste für Materialien
async function renderMaterialsList() {
  const items = await loadIndex('/content/materials/materials.json');
  const ul = document.getElementById('materials-list');
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.title}</strong>
      [<a href="material.html?slug=${item.slug}">Ansehen</a>]
      [<a href="/content/materials/${item.slug}.json" download>JSON</a>]
      ${item.file ? `[<a href="public/materials/${item.file}" download>Download</a>]` : ''}
    `;
    ul.appendChild(li);
  });
}

// Initialisierung
window.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.cards-container')) renderIndex();
  if (document.getElementById('stories-list')) renderArchiveList();
  if (document.getElementById('bios-list')) renderBiosList();
  if (document.getElementById('materials-list')) renderMaterialsList();
  if (document.getElementById('stories-detail')) renderDetail('stories');
  if (document.getElementById('bios-detail')) renderDetail('bios');
  if (document.getElementById('materials-detail')) renderDetail('materials');
});
