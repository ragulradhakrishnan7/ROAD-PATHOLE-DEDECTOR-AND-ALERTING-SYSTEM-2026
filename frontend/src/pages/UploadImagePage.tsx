import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, AlertTriangle, CheckCircle2, RefreshCw, MapPin, X, ShieldAlert, Crosshair } from 'lucide-react';
import { uploadDetectionImage } from '../services/api';
import { DetectionResult } from '../types';
import { Toast } from '../components/Toast';
import { useGeolocation } from '../hooks/useGeolocation';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_IMAGE_SIZE_MB = 25;
const ALLOWED_EXTENSIONS_LABEL = 'JPG, PNG, WEBP';

export const UploadImagePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [toast, setToast] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geo = useGeolocation();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Invalid file type "${file.type.split('/')[1] || 'unknown'}". Supported formats: ${ALLOWED_EXTENSIONS_LABEL}`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      return `File too large (${sizeMB.toFixed(1)} MB). Maximum allowed: ${MAX_IMAGE_SIZE_MB} MB`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Invalid File', message: error });
      return;
    }
    // Revoke old preview URL to prevent memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setUploadProgress(0);
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('latitude', String(geo.latitude || 0));
    formData.append('longitude', String(geo.longitude || 0));
    formData.append('location_name', geo.locationName || 'Unknown Location');

    try {
      const res = await uploadDetectionImage(formData, (progress) => {
        setUploadProgress(progress);
      });
      setResult(res);
      setToast({
        id: Date.now().toString(),
        type: res.total_detected > 0 ? 'warning' : 'success',
        title: res.total_detected > 0 ? '⚠️ Potholes Detected!' : '✅ Road Surface Clear',
        message: res.total_detected > 0
          ? `Detected ${res.total_detected} pothole(s) — ${res.max_severity} severity. Alert generated.`
          : 'No potholes were detected in this image.'
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not process image. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-extrabold flex items-center space-x-3">
          <Upload className="w-7 h-7 text-brand-500" />
          <span>Upload Image for AI Analysis</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload road surface photos to run YOLOv8 bounding box & surface area calculations.
        </p>
        {!geo.loading && !geo.error && (
          <p className="text-xs text-emerald-500 flex items-center space-x-1 mt-1">
            <MapPin className="w-3 h-3" />
            <span>GPS: {geo.locationName} ({geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)})</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upload Dropzone */}
        <div
          className={`bg-white dark:bg-dark-card border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[380px] relative transition-all duration-300 ${
            isDragging
              ? 'dropzone-active border-brand-500'
              : 'border-gray-300 dark:border-gray-800 hover:border-brand-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!previewUrl ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="image-upload-input"
              />
              <div className="space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
                  isDragging ? 'bg-brand-500/20 text-brand-500 scale-110' : 'bg-brand-500/10 text-brand-500'
                }`}>
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {isDragging ? 'Drop Image Here' : 'Drag & Drop Road Photo Here'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Supports {ALLOWED_EXTENSIONS_LABEL} up to {MAX_IMAGE_SIZE_MB}MB</p>
                </div>
                <span className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md">
                  Browse File
                </span>
              </div>
            </>
          ) : (
            <div className="w-full space-y-4">
              {/* Preview Image with Remove Button */}
              <div className="relative group">
                <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-2xl shadow-md" />
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-rose-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Remove file"
                  id="remove-image-btn"
                >
                  <X className="w-4 h-4" />
                </button>
                {selectedFile && (
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-gray-900/70 text-white text-xs rounded-lg backdrop-blur-sm">
                    {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                )}
              </div>

              {/* Upload Progress Bar */}
              {loading && (
                <div className="space-y-1.5">
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="upload-progress-bar h-full rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-brand-500 text-center">
                    {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Analyzing with AI...'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  id="change-image-btn"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Change</span>
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-[2] py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  id="run-detection-btn"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span>{loading ? 'Processing...' : 'Run Pothole Detector'}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 flex flex-col">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Crosshair className="w-5 h-5 text-brand-500" />
            <span>AI Detection Output</span>
          </h3>

          {loading && !result ? (
            /* Shimmer Loading State */
            <div className="flex-1 space-y-4">
              <div className="skeleton-shimmer h-56 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton-shimmer h-20" />
                <div className="skeleton-shimmer h-20" />
              </div>
              <div className="skeleton-shimmer h-12 w-full" />
              <div className="skeleton-shimmer h-12 w-full" />
            </div>
          ) : !result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <AlertTriangle className="w-10 h-10 stroke-1" />
              <p className="text-xs">Upload an image and run detection to view output stats.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              {/* Severity Alert Banner */}
              {result.total_detected > 0 && (result.max_severity === 'Critical' || result.max_severity === 'High') && (
                <div className={`alert-banner p-3 rounded-2xl flex items-center space-x-3 border ${getSeverityColor(result.max_severity)}`}>
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">⚠️ {result.max_severity} Severity Alert</h4>
                    <p className="text-xs opacity-80">
                      {result.total_detected} pothole(s) detected — alert sent to authorities.
                    </p>
                  </div>
                </div>
              )}

              {/* Annotated Image */}
              <img
                src={result.annotated_image_url}
                alt="Annotated"
                className="w-full h-56 object-cover rounded-2xl border border-brand-500/30"
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Potholes</span>
                  <p className="font-extrabold text-lg text-brand-500">{result.total_detected}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Severity</span>
                  <p className={`font-extrabold text-lg ${
                    result.max_severity === 'Critical' ? 'text-rose-500' :
                    result.max_severity === 'High' ? 'text-orange-500' :
                    result.max_severity === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>{result.max_severity}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Avg Conf.</span>
                  <p className="font-extrabold text-lg text-brand-500">{Math.round(result.confidence_avg * 100)}%</p>
                </div>
              </div>

              {/* Location Info */}
              {!geo.loading && !geo.error && result.total_detected > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center space-x-2 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Detection Location: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{geo.locationName}</span>
                    <span className="text-gray-400 ml-1">({geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)})</span>
                  </div>
                </div>
              )}

              {/* Bounding Box Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Bounding Box Details</h4>
                {result.bounding_boxes.map((box, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all hover:scale-[1.01] ${getSeverityColor(box.severity)}`}>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>({box.x1}, {box.y1}) → ({box.x2}, {box.y2})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-emerald-500">{Math.round(box.confidence * 100)}%</span>
                      <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${getSeverityColor(box.severity)}`}>
                        {box.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
