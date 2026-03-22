import { create } from "zustand";

interface AudioState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeParagraphIndex: number;
  setActiveParagraphIndex: (index: number) => void;
}

export const useAudioStore = create<AudioState>()((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  activeParagraphIndex: -1,
  setActiveParagraphIndex: (index) => set({ activeParagraphIndex: index }),
}));
