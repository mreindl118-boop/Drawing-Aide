import { el, ICONS, toast } from '../editor/ui';
import { createProject, deleteProject, duplicateProject, listProjects } from '../core/store';
import type { ProjectMeta } from '../core/types';

/** Procreate-style home screen: grid of project thumbnails. */
export async function renderGallery(root: HTMLElement): Promise<void> {
  root.replaceChildren();
  root.className = 'gallery-root';

  const head = el('div', 'gallery-head');
  head.appendChild(el('h1', 'gallery-title', 'SculptPad'));
  head.appendChild(el('span', 'gallery-sub', '3D asset studio'));
  root.appendChild(head);

  const grid = el('div', 'gallery-grid');
  root.appendChild(grid);

  const projects = await listProjects();

  const newCard = el('button', 'project-card new-card');
  newCard.innerHTML = `<div class="new-plus">${ICONS.plus}</div><span>New project</span>`;
  newCard.addEventListener('click', async () => {
    const meta = await createProject(`Untitled ${projects.length + 1}`);
    location.hash = `#/p/${meta.id}`;
  });
  grid.appendChild(newCard);

  for (const p of projects) {
    grid.appendChild(projectCard(p, () => renderGallery(root)));
  }
}

function projectCard(p: ProjectMeta, refresh: () => void): HTMLElement {
  const card = el('div', 'project-card');
  const thumb = el('div', 'project-thumb');
  if (p.thumb) {
    const img = el('img') as HTMLImageElement;
    img.src = p.thumb;
    img.alt = p.name;
    thumb.appendChild(img);
  } else {
    thumb.classList.add('empty');
    thumb.innerHTML = ICONS.cube;
  }
  const meta = el('div', 'project-meta');
  meta.appendChild(el('span', 'project-title', p.name));
  meta.appendChild(el('span', 'project-date', new Date(p.modified).toLocaleDateString()));
  const menuBtn = el('button', 'card-menu-btn', '⋯');
  card.append(thumb, meta, menuBtn);

  card.addEventListener('click', (e) => {
    if (e.target === menuBtn) return;
    location.hash = `#/p/${p.id}`;
  });

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openCardMenu(card, p, refresh);
  });
  return card;
}

function openCardMenu(card: HTMLElement, p: ProjectMeta, refresh: () => void): void {
  document.querySelector('.card-menu')?.remove();
  const menu = el('div', 'card-menu');
  const mk = (label: string, danger: boolean, fn: () => void): void => {
    const b = el('button', danger ? 'menu-item danger' : 'menu-item', label);
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.remove();
      fn();
    });
    menu.appendChild(b);
  };
  mk('Rename', false, async () => {
    const name = prompt('Project name', p.name);
    if (name?.trim()) {
      const { putProject } = await import('../core/store');
      await putProject({ ...p, name: name.trim(), modified: Date.now() });
      refresh();
    }
  });
  mk('Duplicate', false, async () => {
    await duplicateProject(p.id);
    refresh();
  });
  let confirmArmed = false;
  const del = el('button', 'menu-item danger', 'Delete');
  del.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirmArmed) {
      confirmArmed = true;
      del.textContent = 'Tap again to delete';
      return;
    }
    menu.remove();
    await deleteProject(p.id);
    toast(`Deleted “${p.name}”`, { timeout: 1800 });
    refresh();
  });
  menu.appendChild(del);
  card.appendChild(menu);
  const close = (ev: PointerEvent): void => {
    if (!menu.contains(ev.target as Node)) {
      menu.remove();
      document.removeEventListener('pointerdown', close);
    }
  };
  setTimeout(() => document.addEventListener('pointerdown', close), 0);
}
