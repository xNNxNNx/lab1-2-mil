import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { SpreadsheetDocument } from '../types';

interface DocumentsState {
  list: SpreadsheetDocument[];
  activeDocumentId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  list: [],
  activeDocumentId: null,
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk('documents/fetchAll', async (userId: string) => {
  const { getDocuments } = await import('../api/documentsApi');
  return getDocuments(userId);
});

export const fetchDocument = createAsyncThunk('documents/fetchOne', async (id: string) => {
  const { getDocument } = await import('../api/documentsApi');
  return getDocument(id);
});

export const createDocument = createAsyncThunk(
  'documents/create',
  async (doc: Omit<SpreadsheetDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { createDoc } = await import('../api/documentsApi');
    return createDoc(doc);
  },
);

export const saveDocument = createAsyncThunk('documents/save', async (doc: SpreadsheetDocument) => {
  const { updateDocument } = await import('../api/documentsApi');
  return updateDocument(doc.id, doc);
});

export const deleteDocument = createAsyncThunk('documents/delete', async (id: string) => {
  const { deleteDoc } = await import('../api/documentsApi');
  await deleteDoc(id);
  return id;
});

export const renameDocument = createAsyncThunk(
  'documents/rename',
  async ({ id, title }: { id: string; title: string }) => {
    const { updateDocument } = await import('../api/documentsApi');
    return updateDocument(id, { title } as Partial<SpreadsheetDocument>);
  },
);

export const duplicateDocument = createAsyncThunk('documents/duplicate', async (id: string) => {
  const { getDocument, createDoc } = await import('../api/documentsApi');
  const original = await getDocument(id);
  const copy = { ...original, title: `${original.title} (копия)` };
  return createDoc(copy);
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocument(state, action: PayloadAction<string | null>) {
      state.activeDocumentId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка загрузки';
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload);
      })
      .addCase(renameDocument.fulfilled, (state, action) => {
        const idx = state.list.findIndex((d) => d.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(duplicateDocument.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(saveDocument.fulfilled, (state, action) => {
        const idx = state.list.findIndex((d) => d.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  },
});

export const { setActiveDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
