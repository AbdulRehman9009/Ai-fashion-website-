"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImageUpload({
    onUploadSuccess,
    onUploadError,
    className = "",
    showPreview = true,
    maxSizeMB = 5,
    uploadImmediately = false
}) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validateFile = (file) => {
        if (!file.type.startsWith('image/')) {
            return 'Please upload an image file';
        }
        if (file.size > maxSizeBytes) {
            return `File size must be less than ${maxSizeMB}MB`;
        }
        return null;
    };

    const handleFileSelect = useCallback(async (selectedFile) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            onUploadError?.(validationError);
            return;
        }

        setError(null);
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));

        if (uploadImmediately) {
            await uploadFile(selectedFile);
        }
    }, [uploadImmediately, maxSizeBytes]);

    const uploadFile = async (fileToUpload) => {
        const targetFile = fileToUpload || file;
        if (!targetFile) return null;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', targetFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            onUploadSuccess?.(data.url);
            return data.url;

        } catch (err) {
            const errorMessage = err.message || 'Failed to upload image';
            setError(errorMessage);
            onUploadError?.(errorMessage);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, [handleFileSelect]);

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    
    const getFile = () => file;
    const getPreview = () => preview;
    const upload = () => uploadFile();

    return (
        <div className={`w-full ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-2xl transition-all duration-200
          ${dragActive ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
          ${preview && showPreview ? 'p-4' : 'p-8'}
          ${error ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : ''}
        `}
            >
                {preview && showPreview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl"
                        />
                        <button
                            type="button"
                            onClick={clearFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {!uploadImmediately && (
                            <div className="mt-4 flex gap-2">
                                <Button
                                    type="button"
                                    onClick={triggerFileSelect}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={uploading}
                                >
                                    Change Photo
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => uploadFile()}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 rounded-xl flex items-center justify-center">
                                <div className="text-white text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p className="font-medium">Uploading...</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={triggerFileSelect}
                        className="cursor-pointer text-center space-y-4"
                    >
                        <div className={`
              h-16 w-16 mx-auto rounded-full flex items-center justify-center
              ${dragActive ? 'bg-purple-200 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-800'}
            `}>
                            {dragActive ? (
                                <ImageIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            ) : (
                                <Camera className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                            )}
                        </div>

                        <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">
                                {dragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                PNG, JPG, GIF up to {maxSizeMB}MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

export function useImageUpload({ maxSizeMB = 5, onSuccess, onError } = {}) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [error, setError] = useState(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const selectFile = useCallback((selectedFile) => {
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        if (selectedFile.size > maxSizeBytes) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setUploadedUrl(null);
    }, [maxSizeBytes, maxSizeMB]);

    const upload = useCallback(async () => {
        if (!file) return null;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setUploadedUrl(data.url);
            onSuccess?.(data.url);
            return data.url;

        } catch (err) {
            const errorMessage = err.message || 'Failed to upload image';
            setError(errorMessage);
            onError?.(errorMessage);
            return null;
        } finally {
            setUploading(false);
        }
    }, [file, onSuccess, onError]);

    const clear = useCallback(() => {
        setFile(null);
        setPreview(null);
        setUploadedUrl(null);
        setError(null);
    }, []);

    return {
        file,
        preview,
        uploading,
        uploadedUrl,
        error,
        selectFile,
        upload,
        clear,
        hasFile: !!file,
        isUploaded: !!uploadedUrl,
    };
}
