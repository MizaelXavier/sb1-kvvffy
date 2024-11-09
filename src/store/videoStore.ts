import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Video {
  id: string;
  url: string;
  createdAt: number;
}

interface VideoState {
  videos: Video[];
  addVideo: (url: string) => void;
  removeVideo: (id: string) => void;
}

type VideoStateV1 = {
  version: 1;
  state: {
    videos: { id: string; url: string; }[];
  };
};

type VideoStateV2 = {
  version: 2;
  state: {
    videos: Video[];
  };
};

const migrateV1ToV2 = (persistedState: VideoStateV1): VideoStateV2['state'] => {
  return {
    videos: persistedState.state.videos.map(video => ({
      ...video,
      createdAt: Date.now(),
    })),
  };
};

export const useVideoStore = create<VideoState>()(
  persist(
    (set) => ({
      videos: [],
      addVideo: (url) =>
        set((state) => ({
          videos: [
            ...state.videos,
            {
              id: crypto.randomUUID(),
              url,
              createdAt: Date.now(),
            },
          ],
        })),
      removeVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((video) => video.id !== id),
        })),
    }),
    {
      name: 'video-store',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState, version) => {
        if (version === 1) {
          return migrateV1ToV2(persistedState as VideoStateV1);
        }
        return persistedState as VideoStateV2['state'];
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Video store hydrated successfully:', state.videos.length, 'videos');
        }
      },
    }
  )
);