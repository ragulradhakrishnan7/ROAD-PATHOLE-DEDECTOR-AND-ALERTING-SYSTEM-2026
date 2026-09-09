import React, { useState, useRef, useCallback } from 'react';
import { Video, Upload, Play, CheckCircle2, Film, X, MapPin, ShieldAlert, RefreshCw, Crosshair, Eye, Clock } from 'lucide-react';
import { Toast } from '../components/Toast';
import { uploadDetectionVideo } from '../services/api';
import { VideoDetectionResult } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'video/avi'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
const MAX_VIDEO_SIZE_MB = 500;

export const UploadVideoPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<VideoDetectionResult | null>(null);
  const [toast, setToast] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geo = useGeolocation();

  const validateFile = (file: File): string | null => {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    const isValidType = ALLOWED_VIDEO_TYPES.includes(file.type) || ALLOWED_VIDEO_EXTENSIONS.includes(ext);
    if (!isValidType) {
      return `Unsupported format "${ext}". Accepted: MP4, MOV, AVI, MKV, WEBM`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      return `Video too large (${sizeMB.toFixed(0)} MB). Maximum: ${MAX_VIDEO_SIZE_MB} MB`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Invalid Video', message: error });
      return;
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setSelectedVideo(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setUploadProgress(0);
  }, [videoPreviewUrl]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    setResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessVideo = async () => {
    if (!selectedVideo) return;
    setUploading(true);
    setProcessing(false);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedVideo);
    formData.append('latitude', String(geo.latitude || 0));
    formData.append('longitude', String(geo.longitude || 0));
    formData.append('location_name', geo.locationName || 'Unknown Location');

    try {
      const res = await uploadDetectionVideo(formData, (progress) => {
        setUploadProgress(progress);
        if (progress >= 100) {
          setUploading(false);
          setProcessing(true);
        }
      });
      setResult(res);
      setSelectedFrameIdx(0);
      const hasPotholes = res.total_potholes_detected > 0;
      setToast({
        id: Date.now().toString(),
        type: hasPotholes ? 'warning' : 'success',
        title: hasPotholes ? '⚠️ Potholes Detected in Video!' : '✅ Road Surface Clear',
        message: hasPotholes
          ? `Analyzed ${res.total_frames_analyzed} frames. Found ${res.total_potholes_detected} pothole(s) — ${res.max_severity} severity.`
          : `Analyzed ${res.total_frames_analyzed} frames. No potholes detected.`
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Processing Failed',
        message: 'Could not process video. Please try again.'
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-rose-500';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-rose-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const isLoading = uploading || processing;

  // Frames with detections (keyframes)
  const keyframes = result?.frame_detections.filter(f => f.detection_count > 0) || [];
  const selectedFrame = keyframes[selectedFrameIdx] || null;
  const maxSeverityCount = result
    ? Math.max(
        result.severity_breakdown.Critical,
        result.severity_breakdown.High,
        result.severity_breakdown.Medium,
        result.severity_breakdown.Low,
        1
      )
    : 1;

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
        {!geo.loading && !geo.error && (
          <p className="text-xs text-emerald-500 flex items-center space-x-1 mt-1">
            <MapPin className="w-3 h-3" />
            <span>GPS: {geo.locationName} ({geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)})</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upload Container */}
        <div
          className={`bg-white dark:bg-dark-card border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[380px] relative transition-all duration-300 ${
            isDragging
              ? 'dropzone-active border-amber-500'
              : 'border-gray-300 dark:border-gray-800 hover:border-amber-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!videoPreviewUrl ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="video-upload-input"
              />
              <div className="space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
                  isDragging ? 'bg-amber-500/20 text-amber-500 scale-110' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <Film className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {isDragging ? 'Drop Video Here' : 'Drag & Drop Video File'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Supports MP4, MOV, AVI, MKV, WEBM up to {MAX_VIDEO_SIZE_MB}MB</p>
                </div>
                <span className="inline-block px-5 py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md">
                  Browse Video
                </span>
              </div>
            </>
          ) : (
            <div className="w-full space-y-4">
              {/* Video Preview with Remove Button */}
              <div className="relative group">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-52 object-cover rounded-2xl shadow-md bg-black"
                  id="video-preview"
                />
                <button
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-rose-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Remove video"
                  id="remove-video-btn"
                >
                  <X className="w-4 h-4" />
                </button>
                {selectedVideo && (
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-gray-900/70 text-white text-xs rounded-lg backdrop-blur-sm">
                    {selectedVideo.name} · {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                )}
              </div>

              {/* Upload / Processing Progress */}
              {isLoading && (
                <div className="space-y-1.5">
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    {uploading ? (
                      <div
                        className="upload-progress-bar-amber h-full rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    ) : (
                      <div className="upload-progress-bar-amber h-full rounded-full w-full processing-pulse" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-amber-500 text-center">
                    {uploading
                      ? `Uploading video... ${uploadProgress}%`
                      : '🔬 Extracting frames & running YOLOv8 AI analysis...'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!result && (
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    id="change-video-btn"
                  >
                    <Film className="w-4 h-4" />
                    <span>Change</span>
                  </button>
                  <button
                    onClick={handleProcessVideo}
                    disabled={isLoading}
                    className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    id="start-video-analysis-btn"
                  >
                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isLoading ? 'Processing...' : 'Start Video Analysis'}</span>
                  </button>
                </div>
              )}

              {/* Completed – Reset Button */}
              {result && (
                <button
                  onClick={handleRemoveVideo}
                  className="w-full py-3 border border-amber-500/30 text-amber-500 font-bold rounded-xl hover:bg-amber-500/5 flex items-center justify-center space-x-2 transition"
                  id="analyze-another-btn"
                >
                  <Upload className="w-4 h-4" />
                  <span>Analyze Another Video</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Video Processing Results */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 flex flex-col">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Crosshair className="w-5 h-5 text-amber-500" />
            <span>Frame Analysis Metrics</span>
          </h3>

          {/* Loading Skeleton */}
          {isLoading && !result ? (
            <div className="flex-1 space-y-4">
              <div className="skeleton-shimmer h-16 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton-shimmer h-20" />
                <div className="skeleton-shimmer h-20" />
              </div>
              <div className="skeleton-shimmer h-24 w-full" />
              <div className="skeleton-shimmer h-40 w-full" />
            </div>
          ) : !result ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2 py-12">
              <Video className="w-10 h-10 stroke-1" />
              <p className="text-xs text-center">Select a video and start analysis to see frame-by-frame detection results.</p>
            </div>
          ) : (
            /* Results */
            <div className="space-y-4 overflow-y-auto flex-1">
              {/* Severity Alert */}
              {result.total_potholes_detected > 0 && (result.max_severity === 'Critical' || result.max_severity === 'High') && (
                <div className="alert-banner p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center space-x-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">🚨 {result.max_severity} Severity Alert</h4>
                    <p className="text-xs opacity-80">
                      {result.total_potholes_detected} pothole(s) found across {keyframes.length} frames. Alert generated.
                    </p>
                  </div>
                </div>
              )}

              {/* Success Banner */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Processing Complete</h4>
                  <p className="text-xs opacity-80">All frames analyzed. Results geotagged and saved.</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Frames</span>
                  <p className="font-extrabold text-lg text-gray-900 dark:text-white">{result.total_frames_analyzed}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Potholes</span>
                  <p className="font-extrabold text-lg text-amber-500">{result.total_potholes_detected}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Severity</span>
                  <p className={`font-extrabold text-lg ${getSeverityColor(result.max_severity)}`}>{result.max_severity}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Avg Conf.</span>
                  <p className="font-extrabold text-lg text-brand-500">{Math.round(result.confidence_avg * 100)}%</p>
                </div>
              </div>

              {/* Severity Breakdown */}
              {result.total_potholes_detected > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Severity Breakdown</h4>
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => {
                    const count = result.severity_breakdown[sev] || 0;
                    if (count === 0) return null;
                    const pct = (count / maxSeverityCount) * 100;
                    return (
                      <div key={sev} className="flex items-center space-x-3 text-xs">
                        <span className={`w-16 font-semibold ${getSeverityColor(sev)}`}>{sev}</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`severity-bar h-full rounded-full ${getSeverityBg(sev)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-bold w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* GPS Location */}
              {!geo.loading && !geo.error && result.total_potholes_detected > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center space-x-2 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Location: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{geo.locationName}</span>
                    <span className="text-gray-400 ml-1">({geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)})</span>
                  </div>
                </div>
              )}

              {/* Annotated Keyframes Gallery */}
              {keyframes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detected Keyframes ({keyframes.length})</span>
                  </h4>

                  {/* Frame Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {keyframes.map((frame, idx) => (
                      <button
                        key={frame.frame_number}
                        onClick={() => setSelectedFrameIdx(idx)}
                        className={`keyframe-thumb flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedFrameIdx === idx
                            ? 'border-amber-500 ring-2 ring-amber-500/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-500/50'
                        }`}
                      >
                        {frame.annotated_frame_url ? (
                          <img
                            src={frame.annotated_frame_url}
                            alt={`Frame ${frame.frame_number}`}
                            className="w-20 h-14 object-cover"
                          />
                        ) : (
                          <div className="w-20 h-14 bg-gray-100 dark:bg-dark-surface flex items-center justify-center">
                            <Film className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="px-1.5 py-0.5 text-[10px] font-bold text-center bg-gray-50 dark:bg-dark-surface">
                          <span className="text-amber-500">{frame.detection_count}</span>
                          <span className="text-gray-400"> @ {frame.timestamp_sec}s</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Frame Detail */}
                  {selectedFrame && (
                    <div className="space-y-2 p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Frame #{selectedFrame.frame_number}</span>
                          <span className="text-gray-400">({selectedFrame.timestamp_sec}s)</span>
                        </span>
                        <span className="font-bold text-amber-500">{selectedFrame.detection_count} detection(s)</span>
                      </div>

                      {selectedFrame.annotated_frame_url && (
                        <img
                          src={selectedFrame.annotated_frame_url}
                          alt={`Annotated Frame ${selectedFrame.frame_number}`}
                          className="w-full h-40 object-cover rounded-xl border border-amber-500/30"
                        />
                      )}

                      {/* Bounding Boxes for selected frame */}
                      {selectedFrame.bounding_boxes.map((box, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs"
                        >
                          <span>Box #{bIdx + 1} ({box.x1},{box.y1})→({box.x2},{box.y2})</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-emerald-500">{Math.round(box.confidence * 100)}%</span>
                            <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${getSeverityColor(box.severity)} bg-current/10`}>
                              {box.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
