import React, { useState } from 'react';
import { Video, Upload, Play, CheckCircle2, Film } from 'lucide-react';
import { Toast } from '../components/Toast';

export const UploadVideoPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<any>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0]);
      setCompleted(false);
    }
  };

  const handleProcessVideo = () => {
    if (!selectedVideo) return;
    setProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          setCompleted(true);
          setToast({
            id: '1',
            type: 'success',
            title: 'Video Stream Processing Complete',
            message: 'Analyzed 1,420 frames. Identified 14 pothole incidents.'
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-extrabold flex items-center space-x-3">
          <Video className="w-7 h-7 text-amber-500" />
          <span>Upload Dashcam / Drone Video</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Process full MP4/AVI videos frame-by-frame for road condition surveys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upload Container */}
        <div className="bg-white dark:bg-dark-card border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[380px] relative">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{selectedVideo ? selectedVideo.name : 'Select Dashcam Video File'}</h3>
              <p className="text-xs text-gray-500 mt-1">Supports MP4, MOV, AVI up to 500MB</p>
            </div>
            {selectedVideo && !completed && (
              <button
                onClick={handleProcessVideo}
                disabled={processing}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 mx-auto"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{processing ? `Processing (${progress}%)` : 'Start Video Analysis'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Processing Telemetry */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-lg">Frame Analysis Metrics</h3>

          {processing && (
            <div className="space-y-3 py-12 text-center">
              <div className="w-full bg-gray-200 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs font-bold text-amber-500">Extracting & running YOLOv8 on frames... {progress}%</p>
            </div>
          )}

          {completed && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <h4 className="font-bold text-sm">Processing Finished</h4>
                  <p className="text-xs">All pothole frames geotagged and exported to database.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Total Frames</span>
                  <p className="font-extrabold text-lg text-gray-900 dark:text-white">1,420</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Incidents Detected</span>
                  <p className="font-extrabold text-lg text-amber-500">14</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
