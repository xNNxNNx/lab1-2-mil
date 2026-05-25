import type { SpreadsheetDocument } from '../types';

const STORAGE_KEY = 'spreadsheet_docs';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadDocs(): SpreadsheetDocument[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveDocs(docs: SpreadsheetDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export async function getDocuments(userId: string): Promise<SpreadsheetDocument[]> {
  const docs = loadDocs().filter((d) => d.userId === userId);
  return delay(docs);
}

export async function getDocument(id: string): Promise<SpreadsheetDocument> {
  const doc = loadDocs().find((d) => d.id === id);
  if (!doc) throw new Error('Документ не найден 😔');
  return delay(doc);
}

export async function createDoc(
  data: Omit<SpreadsheetDocument, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<SpreadsheetDocument, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<SpreadsheetDocument> {
  const docs = loadDocs();
  const now = new Date().toISOString();
  const doc: SpreadsheetDocument = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  docs.push(doc);
  saveDocs(docs);
  return delay(doc);
}

export async function updateDocument(
  id: string,
  patch: Partial<SpreadsheetDocument>,
): Promise<SpreadsheetDocument> {
  const docs = loadDocs();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error('Документ не найден 😔');
  docs[idx] = { ...docs[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDocs(docs);
  return delay(docs[idx]);
}

export async function deleteDoc(id: string): Promise<void> {
  const docs = loadDocs().filter((d) => d.id !== id);
  saveDocs(docs);
  return delay(undefined);
}
