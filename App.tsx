
import React, { useState, useCallback, useRef } from 'react';
import { UploadedImage } from './types';
import { fileToUploadedImage } from './utils/fileUtils';
import { generateCreativeImage } from './services/geminiService';
import { ImagePreview } from './components/ImagePreview';
import { Spinner } from './components/Spinner';
import { UploadIcon, SparklesIcon } from './components/Icons';

const MAX_IMAGES = 5;

export default function App() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setError(null);
    const newImages: File[] = Array.from(files);
    
    if (uploadedImages.length + newImages.length > MAX_IMAGES) {
        setError(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        return;
    }

    try {
      const processedImages = await Promise.all(newImages.map(fileToUploadedImage));
      setUploadedImages(prev => [...prev, ...processedImages]);
    } catch (err) {
      setError('Error processing files. Please try again with valid image files.');
      console.error(err);
    }
  }, [uploadedImages]);

  const handleRemoveImage = useCallback((id: string) => {
    setUploadedImages(prev => prev.filter(image => image.id !== id));
  }, []);

  const handleGenerate = async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultImageUrl = await generateCreativeImage(uploadedImages, prompt);
      setGeneratedImage(resultImageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-7xl mx-auto flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">
            Creative Friends Photo Booth
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Upload photos, describe a scene, and let AI create a new picture of you and your friends!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="bg-slate-800/50 rounded-2xl p-6 flex flex-col gap-6 ring-1 ring-white/10">
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-sky-400">1. Upload Your Photos</h2>
              <p className="text-slate-400 mb-4">Add up to {MAX_IMAGES} individual photos of people.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {uploadedImages.map(image => (
                  <ImagePreview key={image.id} image={image} onRemove={handleRemoveImage} />
                ))}
              </div>
               <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
                disabled={isLoading}
              />
              <button
                onClick={triggerFileInput}
                disabled={isLoading || uploadedImages.length >= MAX_IMAGES}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <UploadIcon />
                {uploadedImages.length > 0 ? 'Add More Photos' : 'Select Photos'}
              </button>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-sky-400">2. Describe the Scene</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A photo of my friends as astronauts on the moon, cinematic lighting"
                className="w-full h-32 p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none placeholder-slate-400"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || uploadedImages.length === 0 || !prompt.trim()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
              {!isLoading && <SparklesIcon />}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="bg-slate-800/50 rounded-2xl p-6 flex flex-col justify-center items-center aspect-square ring-1 ring-white/10">
            <h2 className="text-2xl font-semibold mb-4 text-sky-400 self-start">3. Your Creation</h2>
            <div className="w-full h-full flex justify-center items-center bg-slate-900/50 rounded-lg overflow-hidden">
              {isLoading && <Spinner />}
              {error && !isLoading && (
                  <div className="text-center text-red-400 px-4">
                      <p className="font-semibold">Oops! Something went wrong.</p>
                      <p className="text-sm">{error}</p>
                  </div>
              )}
              {!isLoading && !generatedImage && !error && (
                <div className="text-center text-slate-400">
                  <p className="text-lg">Your generated image will appear here.</p>
                </div>
              )}
              {generatedImage && !isLoading && (
                <img
                  src={generatedImage}
                  alt="Generated by AI"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
