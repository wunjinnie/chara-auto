import React, { useState } from 'react';

interface SongInputFormProps {
  onGenerate: (songTitle: string, lyrics: string) => void;
  error: string | null;
}

const SongInputForm: React.FC<SongInputFormProps> = ({ onGenerate, error }) => {
  const [songTitle, setSongTitle] = useState('');
  const [lyrics, setLyrics] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (songTitle.trim() && lyrics.trim()) {
      onGenerate(songTitle, lyrics);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-8 max-w-2xl mx-auto animate-fade-in">
        <h2 className="text-2xl font-semibold text-center mb-2">Bring Your Song to Life</h2>
        <p className="text-center text-slate-400 mb-6">Enter your song's details to begin generating a music video concept.</p>
      
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                <p className="font-bold">An error occurred</p>
                <p>{error}</p>
            </div>
        )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="songTitle" className="block text-sm font-medium text-slate-300 mb-2">
            Song Title
          </label>
          <input
            id="songTitle"
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="e.g., 'Starlight Echoes'"
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="lyrics" className="block text-sm font-medium text-slate-300 mb-2">
            Lyrics
          </label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Paste your song lyrics here..."
            rows={10}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            required
          />
        </div>
        <button
          type="submit"
          disabled={!songTitle.trim() || !lyrics.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          Generate Characters
        </button>
      </form>
    </div>
  );
};

export default SongInputForm;
