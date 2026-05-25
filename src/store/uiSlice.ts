import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  saveStatus: 'saved' | 'saving' | 'error' | 'idle';
  showCreateModal: boolean;
  showDeleteConfirm: string | null;
  notification: { message: string; type: 'success' | 'error' } | null;
}

const initialState: UiState = {
  saveStatus: 'idle',
  showCreateModal: false,
  showDeleteConfirm: null,
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaveStatus(state, action: PayloadAction<UiState['saveStatus']>) {
      state.saveStatus = action.payload;
    },
    openCreateModal(state) {
      state.showCreateModal = true;
    },
    closeCreateModal(state) {
      state.showCreateModal = false;
    },
    setDeleteConfirm(state, action: PayloadAction<string | null>) {
      state.showDeleteConfirm = action.payload;
    },
    showNotification(
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' }>,
    ) {
      state.notification = action.payload;
    },
    clearNotification(state) {
      state.notification = null;
    },
  },
});

export const {
  setSaveStatus,
  openCreateModal,
  closeCreateModal,
  setDeleteConfirm,
  showNotification,
  clearNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
