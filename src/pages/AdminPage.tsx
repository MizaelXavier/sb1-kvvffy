import React, { useState } from 'react';
import { useVideoStore } from '../store/videoStore';
import { Trash2 } from 'lucide-react';

const AdminPage = () => {
  const [url, setUrl] = useState('');
  const { addVideo, removeVideo, videos } = useVideoStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      addVideo(url);
      setUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Video Admin Panel</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter HLS (.m3u8) video URL"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Video
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Video List</h2>
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded"
            >
              <div className="flex-1 truncate mr-4">
                <p className="text-sm text-gray-300">{video.url}</p>
              </div>
              <button
                onClick={() => removeVideo(video.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;