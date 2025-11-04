'use client';

import React, { useState } from 'react';
import { handleExtractScenesFromFile } from '@/app/actions';
import { AppHeader } from '@/components/app/header';
import { ScenesSidebar } from '@/components/app/scenes-sidebar';
import { ScriptForm } from '@/components/app/script-form';
import { StoryboardTabs } from '@/components/app/storyboard-tabs';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Animation, DetailedImage, Scene, Sketch } from '@/types/script-vision';

export default function HomePage() {
  const [isExtractingScenes, setIsExtractingScenes] = useState(false);
  const [isGeneratingSketches, setIsGeneratingSketches] = useState<string[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [detailedImages, setDetailedImages] = useState<DetailedImage[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedDetailedImageIds, setSelectedDetailedImageIds] = useState<
    number[]
  >([]);
  const [selectedSketchUrls, setSelectedSketchUrls] = useState<string[]>([]);

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
      const result = await handleExtractScenesFromFile(formData);

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'An unknown error occurred while extracting scenes.',
        });
        setIsExtractingScenes(false);
        return;
      }
      
      // Handle the stream
      const reader = result.getReader();
      const decoder = new TextDecoder();
      let accumulatedJson = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        accumulatedJson += decoder.decode(value, { stream: true });
      }

      // Final decode to handle any remaining bytes
      accumulatedJson += decoder.decode();

      try {
        const parsedScenes = JSON.parse(accumulatedJson);
        if (Array.isArray(parsedScenes)) {
          setScenes(parsedScenes);
          setSelectedSceneId(parsedScenes[0]?.scene_id || null);
        } else {
            throw new Error("Parsed data is not an array.");
        }
      } catch (e) {
          console.error("Failed to parse final JSON:", e, "Accumulated JSON:", accumulatedJson);
          toast({
              variant: 'destructive',
              title: 'Processing Error',
              description: 'Failed to process the data from the AI model. The format was invalid.',
          });
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
    
    // Using mock data for sketch generation
    const mockImageUrls = scene.subscenes.map((subscene, index) => 
        `https://picsum.photos/seed/${subscene.subscene_id}/${index}/480/480`
    );

    const newSketch = { sceneId: scene.scene_id, imageUrls: mockImageUrls };
    setSketches(prev => {
        const otherSketches = prev.filter(s => s.sceneId !== scene.scene_id);
        return [...otherSketches, newSketch];
    });

    setIsGeneratingSketches(prev => prev.filter(id => id !== scene.scene_id));
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
      const sceneId = sketches.find(s => s.imageUrls.includes(url))?.sceneId;
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

  const selectedScene = scenes.find((s) => s.scene_id === selectedSceneId);
  
  if (scenes.length === 0) {
    return <ScriptForm onSubmit={handleScriptSubmit} isLoading={isExtractingScenes} />;
  }


  return (
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
            onGenerateSketch={() => selectedScene && handleGenerateSketchForScene(selectedScene)}
            selectedSketchUrls={selectedSketchUrls}
            onSelectSketch={handleSelectSketch}
            onDownloadSelectedSketches={handleDownloadSelectedSketches}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
