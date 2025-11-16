'use client';

import React, { useState } from 'react';
import { handleExtractScenesFromFile, handleRegenerateSketch, handleGenerateSketches, handleGenerateDetailedImages } from '@/app/actions';
import { AppHeader } from '@/components/app/header';
import { ScenesSidebar } from '@/components/app/scenes-sidebar';
import { ScriptForm } from '@/components/app/script-form';
import { StoryboardTabs } from '@/components/app/storyboard-tabs';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import type { DetailedImage, Scene, Sketch, SketchViewMode, DownloadContext, DownloadOptions } from '@/types/script-vision';
import { InsertSketchModal } from '@/components/app/insert-sketch-modal';
import { DownloadModal } from '@/components/app/download-modal';
import JSZip from 'jszip';

declare const saveAs: (blob: Blob, filename: string) => void;

export default function HomePage() {
  const [isExtractingScenes, setIsExtractingScenes] = useState(false);
  const [isGenerating, setIsGenerating] = useState<{ sketches: string[], detailed: string[] }>({ sketches: [], detailed: [] });
  const [isRegeneratingSketch, setIsRegeneratingSketch] = useState<string | null>(null); // imageUrl
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [detailedImages, setDetailedImages] = useState<Sketch[]>([]); // Use Sketch type to store by scene
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedSketchUrls, setSelectedSketchUrls] = useState<string[]>([]);
  
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [isInserting, setIsInserting] = useState(false);

  const [sketchViewMode, setSketchViewMode] = useState<SketchViewMode>('carousel');

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadContext, setDownloadContext] = useState<DownloadContext>({ type: 'project' });
  const [isDownloading, setIsDownloading] = useState(false);


  const { toast } = useToast();

  const handleScriptSubmit = async (file: File) => {
    setIsExtractingScenes(true);
    setScenes([]);
    setSketches([]);
    setDetailedImages([]);
    setSelectedSketchUrls([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await handleExtractScenesFromFile(formData);

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'An unknown error occurred while extracting scenes.',
        });
        return;
      }
      
      if (Array.isArray(result)) {
        setScenes(result);
        setSelectedSceneId(result[0]?.scene_id || null);
      } else {
        throw new Error("Received invalid data from server.");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `An unexpected error occurred: ${errorMessage}`,
      });
    } finally {
        setIsExtractingScenes(false);
    }
  };

 const handleGenerateSketchesForScene = async (scene: Scene) => {
    setIsGenerating(prev => ({ ...prev, sketches: [...prev.sketches, scene.scene_id] }));
    
    try {
        const result = await handleGenerateSketches(scene);

        if ('error' in result) {
            throw new Error(result.error);
        }

        const newSketch: Sketch = { sceneId: scene.scene_id, images: result };
        setSketches(prev => {
            const otherSketches = prev.filter(s => s.sceneId !== scene.scene_id);
            return [...otherSketches, newSketch];
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            variant: 'destructive',
            title: 'Error Generating Sketches',
            description: errorMessage,
        });
    } finally {
        setIsGenerating(prev => ({ ...prev, sketches: prev.sketches.filter(id => id !== scene.scene_id) }));
    }
};

const handleGenerateDetailedImagesForScene = async (scene: Scene) => {
    setIsGenerating(prev => ({ ...prev, detailed: [...prev.detailed, scene.scene_id] }));
    
    try {
        const result = await handleGenerateDetailedImages(scene);

        if ('error' in result) {
            throw new Error(result.error);
        }
        
        // We receive DetailedImage[], but store as Sketch[] for consistency
        const newDetailedImages: Sketch = { 
            sceneId: scene.scene_id, 
            images: result.map(img => ({ imageUrl: img.imageUrl, prompt: img.prompt }))
        };

        setDetailedImages(prev => {
            const otherImages = prev.filter(s => s.sceneId !== scene.scene_id);
            return [...otherImages, newDetailedImages];
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            variant: 'destructive',
            title: 'Error Generating Detailed Images',
            description: errorMessage,
        });
    } finally {
        setIsGenerating(prev => ({ ...prev, detailed: prev.detailed.filter(id => id !== scene.scene_id) }));
    }
};


 const handleRegenerate = async (sceneId: string, imageIndex: number, newPrompt: string) => {
    const originalSketch = sketches.find(s => s.sceneId === sceneId);
    if (!originalSketch) return;
    
    const originalImageUrl = originalSketch.images[imageIndex].imageUrl;
    setIsRegeneratingSketch(originalImageUrl);

    try {
      const result = await handleRegenerateSketch(newPrompt);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        return;
      }

      setSketches(prevSketches => {
        return prevSketches.map(sketch => {
          if (sketch.sceneId === sceneId) {
            const updatedImages = [...sketch.images];
            updatedImages[imageIndex] = result;
            return { ...sketch, images: updatedImages };
          }
          return sketch;
        });
      });

      toast({
        title: 'Sketch Regenerated',
        description: 'The sketch has been updated with the new version.',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Regenerating Sketch',
        description: errorMessage,
      });
    } finally {
      setIsRegeneratingSketch(null);
    }
  };

  const handleOpenInsertModal = (index: number) => {
    setInsertAtIndex(index);
    setIsInsertModalOpen(true);
  };
  
  const handleInsertSketch = async (prompt: string) => {
    if (insertAtIndex === null || !selectedSceneId) return;
    
    setIsInserting(true);
    
    try {
        const result = await handleRegenerateSketch(prompt);
        if ('error' in result) {
            throw new Error(result.error);
        }

        setSketches(prevSketches => {
            return prevSketches.map(sketch => {
                if (sketch.sceneId === selectedSceneId) {
                    const updatedImages = [...sketch.images];
                    updatedImages.splice(insertAtIndex, 0, result);
                    return { ...sketch, images: updatedImages };
                }
                return sketch;
            });
        });

        toast({
            title: 'Sketch Inserted',
            description: 'A new sketch has been added to the storyboard.',
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            variant: 'destructive',
            title: 'Error Inserting Sketch',
            description: errorMessage,
        });
    } finally {
        setIsInserting(false);
        setIsInsertModalOpen(false);
        setInsertAtIndex(null);
    }
  };

  const handleSelectSketch = (imageUrl: string) => {
    setSelectedSketchUrls(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      }
      return [...prev, imageUrl];
    });
  };

  const handleDownloadSelectedSketches = () => {
    if (selectedSketchUrls.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No sketches selected',
        description: 'Please select one or more sketches to download.',
      });
      return;
    }
    
    selectedSketchUrls.forEach((url, index) => {
      const link = document.createElement('a');
      link.href = url;
      const sceneId = sketches.find(s => s.images.some(i => i.imageUrl === url))?.sceneId;
      link.download = `scene-${sceneId}-sketch-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast({
      title: 'Download Started',
      description: `Downloading ${selectedSketchUrls.length} sketch(es).`,
    });
  };

  const handleInitiateDownload = (context: DownloadContext) => {
    setDownloadContext(context);
    setIsDownloadModalOpen(true);
  };

  const handleConfirmDownload = async (options: DownloadOptions) => {
    setIsDownloading(true);
    setIsDownloadModalOpen(false);

    toast({
      title: 'Preparing Download',
      description: 'Gathering files, please wait...',
    });

    try {
      const sceneIdsToDownload = downloadContext.type === 'scene' ? [downloadContext.sceneId] : scenes.map(s => s.scene_id);
      
      const imagesToDownload: { url: string; filename: string }[] = [];

      if (options.content.includes('sketches')) {
        sketches
          .filter(s => sceneIdsToDownload.includes(s.sceneId))
          .forEach(s => {
            s.images.forEach((img, index) => {
              imagesToDownload.push({
                url: img.imageUrl,
                filename: `Scene_${s.sceneId}/Sketches/Sketch_${index + 1}.${options.format}`,
              });
            });
          });
      }

      if (options.content.includes('detailed')) {
        detailedImages
          .filter(d => sceneIdsToDownload.includes(d.sceneId))
          .forEach((imgCollection, collIndex) => {
            imgCollection.images.forEach((img, index) => {
                 imagesToDownload.push({
                    url: img.imageUrl,
                    filename: `Scene_${imgCollection.sceneId}/Detailed/Detailed_${index + 1}.${options.format}`,
                });
            });
          });
      }
      
      if (imagesToDownload.length === 0) {
        toast({ variant: 'destructive', title: 'Nothing to Download', description: 'No images of the selected type were found.' });
        setIsDownloading(false);
        return;
      }

      if (options.format === 'zip') {
        const zip = new JSZip();
        const imagePromises = imagesToDownload.map(async (img) => {
          const response = await fetch(img.url);
          const blob = await response.blob();
          zip.file(img.filename, blob);
        });

        await Promise.all(imagePromises);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${downloadContext.type === 'scene' ? `Scene_${downloadContext.sceneId}` : 'ScriptVision_Project'}.zip`);
      } else {
        imagesToDownload.forEach(img => {
           const filename = img.filename.replace(/\.zip/i, `.${options.format}`);
          saveAs(img.url, filename.replace(/\//g, '_'));
        });
      }

      toast({
        title: 'Download Started',
        description: `${imagesToDownload.length} image(s) are being downloaded.`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ variant: 'destructive', title: 'Download Failed', description: errorMessage });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCommentChange = (sceneId: string, subsceneId: string | null, text: string) => {
    setScenes(prevScenes =>
      prevScenes.map(scene => {
        if (scene.scene_id === sceneId) {
          if (subsceneId) {
            const updatedSubscenes = scene.subscenes.map(subscene => {
              if (subscene.subscene_id === subsceneId) {
                return { ...subscene, comment: text };
              }
              return subscene;
            });
            return { ...scene, subscenes: updatedSubscenes };
          } else {
            return { ...scene, comment: text };
          }
        }
        return scene;
      })
    );
  };

  const selectedScene = scenes.find((s) => s.scene_id === selectedSceneId);
  
  if (scenes.length === 0) {
    return <ScriptForm onSubmit={handleScriptSubmit} isLoading={isExtractingScenes} />;
  }


  return (
    <>
      <InsertSketchModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        onSubmit={handleInsertSketch}
        isLoading={isInserting}
      />
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onSubmit={handleConfirmDownload}
        isLoading={isDownloading}
      />
      <SidebarProvider>
        <ScenesSidebar
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onSelectScene={(id) => {
            setSelectedSceneId(id);
            setSelectedSketchUrls([]); // Reset selection when changing scenes
          }}
          onDownloadProject={() => handleInitiateDownload({ type: 'project' })}
        />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <StoryboardTabs
              scene={selectedScene}
              sketch={sketches.find((s) => s.sceneId === selectedSceneId)}
              detailedImages={detailedImages.find(
                (img) => img.sceneId === selectedSceneId
              )}
              isLoadingSketches={isGenerating.sketches.includes(selectedScene?.scene_id ?? '-1')}
              isLoadingDetailed={isGenerating.detailed.includes(selectedScene?.scene_id ?? '-1')}
              isRegenerating={isRegeneratingSketch}
              onGenerateSketch={() => selectedScene && handleGenerateSketchesForScene(selectedScene)}
              onGenerateDetailed={() => selectedScene && handleGenerateDetailedImagesForScene(selectedScene)}
              onRegenerate={handleRegenerate}
              selectedSketchUrls={selectedSketchUrls}
              onSelectSketch={handleSelectSketch}
              onDownloadSelectedSketches={handleDownloadSelectedSketches}
              onDownloadScene={() => selectedScene && handleInitiateDownload({ type: 'scene', sceneId: selectedScene.scene_id })}
              onInsertSketch={handleOpenInsertModal}
              onCommentChange={handleCommentChange}
              sketchViewMode={sketchViewMode}
              onSketchViewModeChange={setSketchViewMode}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
