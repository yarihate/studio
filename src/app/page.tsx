'use client';

import { useState } from 'react';
import { handleExtractScenes, handleGenerateSketch } from '@/app/actions';
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
  const [isGeneratingSketches, setIsGeneratingSketches] = useState<number[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [detailedImages, setDetailedImages] = useState<DetailedImage[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [selectedDetailedImageIds, setSelectedDetailedImageIds] = useState<
    number[]
  >([]);

  const { toast } = useToast();

  const handleScriptSubmit = async (script: string) => {
    setIsExtractingScenes(true);
    setSketches([]);
    setDetailedImages([]);
    setAnimations([]);

    const sceneResult = await handleExtractScenes(script);

    if (sceneResult.error || !sceneResult.scenes) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          sceneResult.error || 'An unknown error occurred while extracting scenes.',
      });
      setIsExtractingScenes(false);
      return;
    }

    const newScenes = sceneResult.scenes.map((desc, index) => ({
      id: index + 1,
      description: desc,
    }));
    setScenes(newScenes);
    setSelectedSceneId(newScenes[0]?.id || null);
    setIsExtractingScenes(false);

    // Don't auto-generate sketches
  };

  const handleGenerateSketchForScene = async (scene: Scene) => {
    setIsGeneratingSketches(prev => [...prev, scene.id]);
    const sketchResult = await handleGenerateSketch(scene.description);
    if (sketchResult.error || !sketchResult.sketchDataUri) {
      toast({
        variant: 'destructive',
        title: `Error generating sketch for Scene ${scene.id}`,
        description: sketchResult.error,
      });
    } else {
        const newSketch = { sceneId: scene.id, imageUrl: sketchResult.sketchDataUri };
        setSketches(prev => [...prev, newSketch]);
    }
    setIsGeneratingSketches(prev => prev.filter(id => id !== scene.id));
  };


  const handleEnhanceSketch = (sceneId: number) => {
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

  const handleGenerateAnimation = () => {
    if (selectedDetailedImageIds.length !== 2) return;
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
      sceneId: selectedSceneId!,
      imageUrl: placeholder.imageUrl,
    };
    setAnimations(prev => [...prev, newAnimation]);
    setSelectedDetailedImageIds([]);
    toast({
        title: 'Animation Generated',
        description: 'New animation added to the Animations tab.'
    });
  };

  if (scenes.length === 0) {
    return <ScriptForm onSubmit={handleScriptSubmit} isLoading={isExtractingScenes} />;
  }

  const selectedScene = scenes.find((s) => s.id === selectedSceneId);

  return (
    <SidebarProvider>
      <ScenesSidebar
        scenes={scenes}
        selectedSceneId={selectedSceneId}
        onSelectScene={setSelectedSceneId}
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
            isLoading={isGeneratingSketches.includes(selectedScene?.id ?? -1)}
            onGenerateSketch={() => selectedScene && handleGenerateSketchForScene(selectedScene)}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
