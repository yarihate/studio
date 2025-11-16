'use client';

import React, { useState } from 'react';
import { handleExtractScenesFromFile, handleRegenerateSketch } from '@/app/actions';
import { AppHeader } from '@/components/app/header';
import { ScenesSidebar } from '@/components/app/scenes-sidebar';
import { ScriptForm } from '@/components/app/script-form';
import { StoryboardTabs } from '@/components/app/storyboard-tabs';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Animation, DetailedImage, Scene, Sketch, SketchImage } from '@/types/script-vision';
import { generateStoryboardSketches } from '@/ai/flows/generate-storyboard-sketches';
import { InsertSketchModal } from '@/components/app/insert-sketch-modal';

export default function HomePage() {
  const [isExtractingScenes, setIsExtractingScenes] = useState(false);
  const [isGeneratingSketches, setIsGeneratingSketches] = useState<string[]>([]);
  const [isRegeneratingSketch, setIsRegeneratingSketch] = useState<string | null>(null); // imageUrl
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [detailedImages, setDetailedImages] = useState<DetailedImage[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedDetailedImageIds, setSelectedDetailedImageIds] = useState<
    number[]
  >([]);
  const [selectedSketchUrls, setSelectedSketchUrls] = useState<string[]>([]);
  
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [isInserting, setIsInserting] = useState(false);


  const { toast } = useToast();

  const handleScriptSubmit = async (file: File) => {
    setIsExtractingScenes(true);
    setScenes([]);
    setSketches([]);
    setDetailedImages([]);
    setAnimations([]);
    setSelectedSketchUrls([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // We now await the full result, which is either the array of scenes or an error object
      const result = await handleExtractScenesFromFile(formData);

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'An unknown error occurred while extracting scenes.',
        });
        return;
      }
      
      // The result is guaranteed to be a Scene[] array here
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

 const handleGenerateSketchForScene = async (scene: Scene) => {
    setIsGeneratingSketches(prev => [...prev, scene.scene_id]);
    setSelectedSketchUrls([]);
    
    try {
        const shotDetails = scene.subscenes.map(s => ({
          description: s.description,
          location: scene.location.place,
          props: s.props,
        }));
        
        const { sketches: sketchImages } = await generateStoryboardSketches({ shotDetails });

        const newSketch: Sketch = { sceneId: scene.scene_id, images: sketchImages };
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
        setIsGeneratingSketches(prev => prev.filter(id => id !== scene.scene_id));
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
            updatedImages[imageIndex] = result; // result is the new SketchImage
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


  const handleEnhanceSketch = (sceneId: string) => {
    const placeholder = PlaceHolderImages.find((img) => img.id === 'detailed-view');
    if (!placeholder) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Detailed image placeholder not found.',
      });
      return;
    }
    const newDetailedImage: DetailedImage = {
      id: Date.now(),
      sceneId,
      imageUrl: placeholder.imageUrl,
    };
    setDetailedImages((prev) => [...prev, newDetailedImage]);
    toast({
      title: 'Success',
      description: 'Image enhanced and added to Detailed Images tab.',
    });
  };

  const handleSelectDetailedImage = (imageId: number) => {
    setSelectedDetailedImageIds((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      }
      if (prev.length < 2) {
        return [...prev, imageId];
      }
      toast({
        variant: 'destructive',
        title: 'Selection Limit',
        description: 'You can only select up to 2 images for animation.',
      });
      return prev;
    });
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

  const handleGenerateAnimation = () => {
    if (selectedDetailedImageIds.length !== 2 || !selectedSceneId) return;
    const placeholder = PlaceHolderImages.find((img) => img.id === 'animation-preview');
     if (!placeholder) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Animation placeholder not found.',
      });
      return;
    }
    const newAnimation: Animation = {
      id: Date.now(),
      sceneId: selectedSceneId,
      imageUrl: placeholder.imageUrl,
    };
    setAnimations(prev => [...prev, newAnimation]);
    setSelectedDetailedImageIds([]);
    toast({
        title: 'Animation Generated',
        description: 'New animation added to the Animations tab.'
    });
  };

  const handleCommentChange = (sceneId: string, subsceneId: string | null, text: string) => {
    setScenes(prevScenes =>
      prevScenes.map(scene => {
        if (scene.scene_id === sceneId) {
          if (subsceneId) {
            // It's a subscene comment
            const updatedSubscenes = scene.subscenes.map(subscene => {
              if (subscene.subscene_id === subsceneId) {
                return { ...subscene, comment: text };
              }
              return subscene;
            });
            return { ...scene, subscenes: updatedSubscenes };
          } else {
            // It's a scene comment
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
      <SidebarProvider>
        <ScenesSidebar
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onSelectScene={(id) => {
            setSelectedSceneId(id);
            setSelectedSketchUrls([]); // Reset selection when changing scenes
          }}
        />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <StoryboardTabs
              scene={selectedScene}
              sketch={sketches.find((s) => s.sceneId === selectedSceneId)}
              detailedImages={detailedImages.filter(
                (img) => img.sceneId === selectedSceneId
              )}
              animations={animations.filter(
                (anim) => anim.sceneId === selectedSceneId
              )}
              onEnhance={handleEnhanceSketch}
              onSelectForAnimation={handleSelectDetailedImage}
              selectedForAnimation={selectedDetailedImageIds}
              onAnimate={handleGenerateAnimation}
              isLoading={isGeneratingSketches.includes(selectedScene?.scene_id ?? '-1')}
              isRegenerating={isRegeneratingSketch}
              onGenerateSketch={() => selectedScene && handleGenerateSketchForScene(selectedScene)}
              onRegenerate={handleRegenerate}
              selectedSketchUrls={selectedSketchUrls}
              onSelectSketch={handleSelectSketch}
              onDownloadSelectedSketches={handleDownloadSelectedSketches}
              onInsertSketch={handleOpenInsertModal}
              onCommentChange={handleCommentChange}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
