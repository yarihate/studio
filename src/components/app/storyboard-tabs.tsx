'use client';
import Image from 'next/image';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Sparkles, Film, Plus } from 'lucide-react';
import type {
  Scene,
  Sketch,
  DetailedImage as DetailedImageType,
  Animation,
} from '@/types/script-vision';

type StoryboardTabsProps = {
  scene: Scene | undefined;
  sketch: Sketch | undefined;
  detailedImages: DetailedImageType[];
  animations: Animation[];
  onEnhance: (sceneId: number) => void;
  onSelectForAnimation: (imageId: number) => void;
  selectedForAnimation: number[];
  onAnimate: () => void;
  isLoading: boolean;
};

const ImageCard = ({
  imageUrl,
  title,
  description,
  imageHint,
  children,
}: {
  imageUrl: string;
  title: string;
  description: string;
  imageHint: string;
  children: React.ReactNode;
}) => (
  <Card className="overflow-hidden">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="aspect-video w-full overflow-hidden rounded-lg border">
        <Image
          src={imageUrl}
          alt={description}
          width={1024}
          height={576}
          className="h-full w-full object-cover transition-transform hover:scale-105"
          data-ai-hint={imageHint}
        />
      </div>
    </CardContent>
    <CardFooter className="gap-2">{children}</CardFooter>
  </Card>
);

export function StoryboardTabs({
  scene,
  sketch,
  detailedImages,
  animations,
  onEnhance,
  onSelectForAnimation,
  selectedForAnimation,
  onAnimate,
  isLoading,
}: StoryboardTabsProps) {
  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a scene to view its storyboard.</p>
      </div>
    );
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-headline">Scene {scene.id}</h2>
        <p className="text-muted-foreground">{scene.description}</p>
      </div>
      <Tabs defaultValue="sketches">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="sketches">Sketches</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Images</TabsTrigger>
                <TabsTrigger value="animations">Animations</TabsTrigger>
            </TabsList>
            {detailedImages.length > 0 && (
                <Button onClick={onAnimate} disabled={selectedForAnimation.length !== 2}>
                    <Film className="mr-2 h-4 w-4" />
                    Generate Animation
                </Button>
            )}
        </div>

        <TabsContent value="sketches" className="mt-4">
          {isLoading ? (
            <Skeleton className="aspect-video w-full rounded-lg" />
          ) : sketch ? (
            <ImageCard
              imageUrl={sketch.imageUrl}
              title="AI Generated Sketch"
              description="Initial black-and-white sketch based on the scene description."
              imageHint="storyboard sketch"
            >
              <Button onClick={() => onEnhance(scene.id)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Enhance
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload(sketch.imageUrl, `scene-${scene.id}-sketch.png`)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </ImageCard>
          ) : (
            <p>No sketch available for this scene.</p>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="mt-4">
          {detailedImages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {detailedImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                    <CardContent className="p-0">
                         <div className="relative group">
                            <Image
                                src={image.imageUrl}
                                alt={`Detailed image for scene ${scene.id}`}
                                width={800}
                                height={800}
                                className="aspect-square h-full w-full object-cover"
                                data-ai-hint="realistic photo"
                            />
                            <div className="absolute top-2 right-2">
                                <Checkbox
                                    checked={selectedForAnimation.includes(image.id)}
                                    onCheckedChange={() => onSelectForAnimation(image.id)}
                                    className="h-6 w-6 border-white bg-black/20 data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleDownload(image.imageUrl, `scene-${scene.id}-detailed-${image.id}.png`)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Detailed Images Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enhance a sketch to generate ultra-realistic images.
                </p>
                <Button className="mt-4" onClick={() => onEnhance(scene.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Enhance First Sketch
                </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="animations" className="mt-4">
           {animations.length > 0 ? (
             <div className="grid gap-4 md:grid-cols-2">
                {animations.map((anim) => (
                    <ImageCard
                        key={anim.id}
                        imageUrl={anim.imageUrl}
                        title="Generated Animation"
                        description="Animated transition between two keyframes."
                        imageHint="animation sequence"
                    >
                         <Button
                            variant="outline"
                            onClick={() => handleDownload(anim.imageUrl, `scene-${scene.id}-animation-${anim.id}.gif`)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </ImageCard>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Animations Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Select two detailed images to generate an animated transition.
                </p>
            </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
