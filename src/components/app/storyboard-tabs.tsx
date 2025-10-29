'use client';
import * as React from 'react';
import Image from 'next/image';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Sparkles, Film, Plus, Wand, Loader2 } from 'lucide-react';
import type {
  Scene,
  Sketch,
  DetailedImage as DetailedImageType,
  Animation,
} from '@/types/script-vision';
import { Badge } from '../ui/badge';

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
  onGenerateSketch: () => void;
  selectedSketchUrls: string[];
  onSelectSketch: (imageUrl: string) => void;
  onDownloadSelectedSketches: () => void;
};


const DetailItem = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div>
        <h4 className="font-semibold text-sm text-foreground/80">{label}</h4>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    );
};

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
  onGenerateSketch,
  selectedSketchUrls,
  onSelectSketch,
  onDownloadSelectedSketches,
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

  const [activeTab, setActiveTab] = React.useState('sketches');

  const { details } = scene;

  return (
    <div>
      <div className="mb-6 bg-card border rounded-lg p-4">
        <h2 className="text-2xl font-bold font-headline mb-2">Scene {scene.id}</h2>
        <p className="text-muted-foreground mb-4">{details.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2 p-3 bg-background rounded-md">
                <h3 className="font-semibold text-base">Shot</h3>
                <DetailItem label="Composition" value={details.shot.composition} />
                <DetailItem label="Camera Motion" value={details.shot.camera_motion} />
            </div>

            {details.subjects?.map((subject, index) => (
              <div key={index} className="space-y-2 p-3 bg-background rounded-md">
                  <h3 className="font-semibold text-base">{subject.name || `Subject ${index + 1}`}</h3>
                  <DetailItem label="Description" value={subject.description} />
                  <DetailItem label="Wardrobe" value={subject.wardrobe} />
              </div>
            ))}

            <div className="space-y-2 p-3 bg-background rounded-md">
                <h3 className="font-semibold text-base">Scene</h3>
                <DetailItem label="Location" value={details.scene.location} />
                <DetailItem label="Time of Day" value={details.scene.time_of_day} />
                <DetailItem label="Environment" value={details.scene.environment} />
            </div>
             <div className="space-y-2 p-3 bg-background rounded-md">
                <h3 className="font-semibold text-base">Visual Details</h3>
                <DetailItem label="Action" value={details.visual_details.action} />
                <DetailItem label="Props" value={details.visual_details.props} />
            </div>
            <div className="space-y-2 p-3 bg-background rounded-md">
                <h3 className="font-semibold text-base">Cinematography</h3>
                <DetailItem label="Lighting" value={details.cinematography.lighting} />
                <DetailItem label="Tone" value={details.cinematography.tone} />
            </div>
        </div>
      </div>
      <Tabs defaultValue="sketches" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="sketches">Sketches</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Images</TabsTrigger>
                <TabsTrigger value="animations">Animations</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
                 {activeTab === 'sketches' && sketch && sketch.imageUrls.length > 0 && (
                    <Button onClick={onDownloadSelectedSketches} disabled={selectedSketchUrls.length === 0} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Selected
                    </Button>
                )}
                {activeTab === 'detailed' && detailedImages.length > 0 && (
                    <Button onClick={onAnimate} disabled={selectedForAnimation.length !== 2}>
                        <Film className="mr-2 h-4 w-4" />
                        Generate Animation
                    </Button>
                )}
            </div>
        </div>

        <TabsContent value="sketches" className="mt-4">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Generating Sketches...</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    The AI is drawing, please wait a moment.
                </p>
            </div>
          ) : sketch && sketch.imageUrls.length > 0 ? (
             <Carousel className="w-full">
                <CarouselContent>
                    {sketch.imageUrls.map((imageUrl, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="relative group aspect-square">
                                            <Image
                                                src={imageUrl}
                                                alt={`AI Generated Sketch ${index + 1}`}
                                                width={480}
                                                height={480}
                                                className="h-full w-full object-cover"
                                                data-ai-hint="storyboard sketch"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Checkbox
                                                    checked={selectedSketchUrls.includes(imageUrl)}
                                                    onCheckedChange={() => onSelectSketch(imageUrl)}
                                                    className="h-6 w-6 border-white bg-black/20 data-[state=checked]:bg-primary"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4">
                                        <Button onClick={() => onEnhance(scene.id)} className="w-full">
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Enhance
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Wand className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Sketches Generated</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Click the button below to generate AI sketches for this scene.
                </p>
                <Button className="mt-4" onClick={onGenerateSketch}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Sketches
                </Button>
            </div>
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
                <Button className="mt-4" onClick={() => onEnhance(scene.id)} disabled={!sketch}>
                    <Plus className="mr-2 h-4 w-4" />
                    Enhance Sketch
                </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="animations" className="mt-4">
           {animations.length > 0 ? (
             <div className="grid gap-4 md:grid-cols-2">
                {animations.map((anim) => (
                    <Card key={anim.id}>
                        <CardHeader>
                            <CardTitle>Generated Animation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Image
                                src={anim.imageUrl}
                                alt="Generated Animation"
                                width={1024}
                                height={576}
                                className="aspect-video w-full rounded-md object-cover"
                                data-ai-hint="animation sequence"
                            />
                        </CardContent>
                         <CardFooter>
                             <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleDownload(anim.imageUrl, `scene-${scene.id}-animation-${anim.id}.gif`)}
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
