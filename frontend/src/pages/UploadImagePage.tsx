import React, { useState } from 'react';
import { Upload, Image as ImageIcon, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { uploadDetectionImage } from '../services/api';
import { DetectionResult } from '../types';
import { Toast } from '../components/Toast';

export const UploadImagePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [toast, setToast] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('latitude', '37.7749');
    formData.append('longitude', '-122.4194');
    formData.append('location_name', 'Market St & 5th St');

    try {
      const res = await uploadDetectionImage(formData);
      setResult(res);
      setToast({
        id: '1',
        type: 'success',
        title: 'Image Analysis Complete',
        message: `Detected ${res.total_detected} pothole(s) with ${res.max_severity} severity.`
      });
    } catch {
      setToast({
        id: '2',
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not process image.'
      });
    } finally {
      setLoading(false);
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upload Dropzone */}
        <div className="bg-white dark:bg-dark-card border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[380px] relative hover:border-brand-500 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {!previewUrl ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Drag & Drop Road Photo Here</h3>
                <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP up to 25MB</p>
              </div>
              <span className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md">
                Browse File
              </span>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-2xl shadow-md" />
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span>{loading ? 'Processing Frame...' : 'Run Pothole Detector'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 flex flex-col">
          <h3 className="font-bold text-lg">AI Detection Output</h3>

          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <AlertTriangle className="w-10 h-10 stroke-1" />
              <p className="text-xs">Upload an image and run detection to view output stats.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={result.annotated_image_url}
                alt="Annotated"
                className="w-full h-56 object-cover rounded-2xl border border-brand-500/30"
              />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Potholes Found</span>
                  <p className="font-extrabold text-lg text-brand-500">{result.total_detected}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Max Severity</span>
                  <p className="font-extrabold text-lg text-rose-500">{result.max_severity}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Bounding Box Details</h4>
                {result.bounding_boxes.map((box, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
                    <span>Box #{idx + 1} ({box.x1}, {box.y1})</span>
                    <span className="font-bold text-emerald-500">{Math.round(box.confidence * 100)}% Conf</span>
                    <span className="font-semibold text-rose-500">{box.severity}</span>
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
