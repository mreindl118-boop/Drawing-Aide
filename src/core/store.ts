import { openDB, type IDBPDatabase } from 'idb';
import type { ProjectMeta, SceneSnapshot } from './types';
import { newId } from './types';

const DB_NAME = 'sculptpad';

let dbPromise: Promise<IDBPDatabase> | null = null;

function db(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(d) {
        d.createObjectStore('projects', { keyPath: 'id' });
        d.createObjectStore('scenes');
      }
    });
  }
  return dbPromise;
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const all = (await (await db()).getAll('projects')) as ProjectMeta[];
  return all.sort((a, b) => b.modified - a.modified);
}

export async function getProject(id: string): Promise<ProjectMeta | undefined> {
  return (await db()).get('projects', id);
}

export async function putProject(meta: ProjectMeta): Promise<void> {
  await (await db()).put('projects', meta);
}

export async function getScene(id: string): Promise<SceneSnapshot | undefined> {
  return (await db()).get('scenes', id);
}

export async function putScene(id: string, snap: SceneSnapshot): Promise<void> {
  await (await db()).put('scenes', snap, id);
}

export async function createProject(name: string): Promise<ProjectMeta> {
  const meta: ProjectMeta = {
    id: newId(),
    name,
    created: Date.now(),
    modified: Date.now(),
    thumb: null
  };
  await putProject(meta);
  return meta;
}

export async function deleteProject(id: string): Promise<void> {
  const d = await db();
  await d.delete('projects', id);
  await d.delete('scenes', id);
}

export async function duplicateProject(id: string): Promise<ProjectMeta | null> {
  const d = await db();
  const meta = (await d.get('projects', id)) as ProjectMeta | undefined;
  if (!meta) return null;
  const scene = (await d.get('scenes', id)) as SceneSnapshot | undefined;
  const copy: ProjectMeta = {
    ...meta,
    id: newId(),
    name: `${meta.name} copy`,
    created: Date.now(),
    modified: Date.now()
  };
  await d.put('projects', copy);
  if (scene) await d.put('scenes', scene, copy.id);
  return copy;
}
