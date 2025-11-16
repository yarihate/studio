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
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Sparkles, Film, Plus, Wand, Loader2, Camera, User, Clock, Drama, Quote, MapPin, Edit, RefreshCw, MessageSquare, DownloadCloud } from 'lucide-react';
import type {
  Scene,
  Sketch,
  DetailedImage as DetailedImageType,
  Animation,
  SketchViewMode,
} from '@/types/script-vision';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ViewSwitcher } from '../ui/view-switcher';

type StoryboardTabsProps = {
  scene: Scene | undefined;
  sketch: Sketch | undefined;
  detailedImages: DetailedImageType[];
  animations: Animation[];
  onEnhance: (sceneId: string) => void;
  onSelectForAnimation: (imageId: number) => void;
  selectedForAnimation: number[];
  onAnimate: () => void;
  isLoading: boolean;
  isRegenerating: string | null;
  onGenerateSketch: () => void;
  onRegenerate: (sceneId: string, imageIndex: number, newPrompt: string) => void;
  onInsertSketch: (index: number) => void;
  selectedSketchUrls: string[];
  onSelectSketch: (imageUrl: string) => void;
  onDownloadSelectedSketches: () => void;
  onDownloadScene: () => void;
  onCommentChange: (sceneId: string, subsceneId: string | null, text: string) => void;
  sketchViewMode: SketchViewMode;
  onSketchViewModeChange: (mode: SketchViewMode) => void;
};


const DetailItem = ({ label, value, icon: Icon }: { label: string; value?: string | string[] | null; icon?: React.ElementType }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className="flex items-start gap-2">
        {Icon && <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />}
        <div>
          <h4 className="font-semibold text-sm text-foreground/80">{label}</h4>
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {value.map((item, index) => (
                <Badge key={index} variant="secondary">{item}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground">{value}</p>
          )}
        </div>
      </div>
    );
};

const InsertButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex-shrink-0 flex items-center justify-center p-1 group-hover/carousel:opacity-100 opacity-0 transition-opacity">
    <Button
      variant="outline"
      size="icon"
      className="rounded-full h-10 w-10"
      onClick={onClick}
    >
      <Plus className="h-5 w-5" />
      <span className="sr-only">Insert sketch</span>
    </Button>
  </div>
);

const SketchCard = ({ scene, image, index, isRegenerating, selectedSketchUrls, onSelectSketch, editingState, handleRegenerateClick, toggleEdit, onEnhance }: any) => {
    const isCurrentlyRegenerating = isRegenerating === image.imageUrl;
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-2 text-center bg-muted">
                <p className="text-xs font-semibold truncate">Под-сцена {scene.subscenes[index]?.subscene_id || `Вставка ${index}`}</p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative group aspect-square">
                    {isCurrentlyRegenerating && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60">
                            <Loader2 className="h-10 w-10 animate-spin text-white" />
                            <p className="mt-2 text-sm text-white">Перегенерация...</p>
                        </div>
                    )}
                    <Image
                        src={image.imageUrl}
                        alt={`Набросок для под-сцены ${scene.subscenes[index]?.subscene_id}`}
                        width={480}
                        height={480}
                        className={`h-full w-full object-cover ${isCurrentlyRegenerating ? 'blur-sm' : ''}`}
                        data-ai-hint="storyboard sketch"
                    />
                    <div className="absolute top-2 right-2">
                        <Checkbox
                            checked={selectedSketchUrls.includes(image.imageUrl)}
                            onCheckedChange={() => onSelectSketch(image.imageUrl)}
                            className="h-6 w-6 border-white bg-black/20 data-[state=checked]:bg-primary"
                            disabled={isCurrentlyRegenerating}
                        />
                    </div>
                </div>
            </CardContent>
            {editingState?.imageUrl === image.imageUrl && (
              <div className="p-4 space-y-2 border-t">
                <Textarea 
                  value={editingState.prompt}
                  onChange={(e) => toggleEdit(image.imageUrl, e.target.value, true)}
                  rows={4} 
                  placeholder="Введите новый промпт..."
                />
                <Button size="sm" className="w-full" onClick={() => handleRegenerateClick(index)} disabled={isCurrentlyRegenerating}>
                    {isCurrentlyRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Перегенерировать
                </Button>
              </div>
            )}
            <CardFooter className="p-4 grid grid-cols-2 gap-2">
                <Button onClick={() => toggleEdit(image.imageUrl, image.prompt)} variant="secondary" className="w-full" disabled={isCurrentlyRegenerating}>
                    <Edit className="mr-2 h-4 w-4" />
                    {editingState?.imageUrl === image.imageUrl ? 'Закрыть' : 'Редактировать'}
                </Button>
                <Button onClick={() => onEnhance(scene.scene_id)} className="w-full" disabled={isCurrentlyRegenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Улучшить
                </Button>
            </CardFooter>
        </Card>
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
  isRegenerating,
  onGenerateSketch,
  onRegenerate,
  onInsertSketch,
  selectedSketchUrls,
  onSelectSketch,
  onDownloadSelectedSketches,
  onDownloadScene,
  onCommentChange,
  sketchViewMode,
  onSketchViewModeChange,
}: StoryboardTabsProps) {
  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Выберите сцену для просмотра.</p>
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
  const [editingState, setEditingState] = React.useState<{imageUrl: string; prompt: string} | null>(null);

  const toggleEdit = (imageUrl: string, currentPrompt: string, isEditing = false) => {
    if (editingState?.imageUrl === imageUrl && !isEditing) {
      setEditingState(null); // Close if already open and not just editing text
    } else {
      setEditingState({ imageUrl, prompt: currentPrompt }); // Open for editing or update prompt
    }
  };
  
  const handleRegenerateClick = (imageIndex: number) => {
    if (editingState && scene) {
      onRegenerate(scene.scene_id, imageIndex, editingState.prompt);
      setEditingState(null); // Close editor on regenerate
    }
  };

  const hasSketches = sketch && sketch.images.length > 0;
  const hasDetailedImages = detailedImages && detailedImages.length > 0;
  const canDownloadScene = hasSketches || hasDetailedImages;

  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Сцена {scene.scene_id}: {scene.scene_title}</CardTitle>
            <CardDescription>{scene.general_context}</CardDescription>
          </div>
          <Button onClick={onDownloadScene} variant="outline" disabled={!canDownloadScene}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            Download Scene
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <DetailItem label="Персонажи" value={scene.characters} icon={User} />
            <DetailItem label="Время" value={scene.time_period} icon={Clock} />
            <DetailItem label="Локация" value={scene.location?.place} icon={MapPin} />
          </div>
           <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm text-foreground/80">Комментарии к сцене</h4>
            </div>
            <Textarea
              placeholder="Добавьте ваши заметки к сцене здесь..."
              value={scene.comment || ''}
              onChange={(e) => onCommentChange(scene.scene_id, null, e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline">Под-сцены</h3>
            {scene.subscenes.map((sub, index) => (
              <div key={sub.subscene_id} className="p-4 bg-background rounded-lg border">
                <h4 className="font-bold mb-2">Под-сцена {sub.subscene_id}</h4>
                <p className="mb-3 text-sm text-foreground">{sub.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <DetailItem label="Эмоция" value={sub.emotion} icon={Drama} />
                  <DetailItem label="Камера" value={sub.camera_hint} icon={Camera} />
                  <DetailItem label="Реквизит" value={sub.props} />
                  {sub.dialogue_excerpt && <DetailItem label="Диалог" value={`"${sub.dialogue_excerpt}"`} icon={Quote} />}
                </div>
                <div className="space-y-2 mt-4">
                   <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold text-xs text-foreground/80">Комментарии к под-сцене</h4>
                  </div>
                  <Textarea
                    placeholder="Добавьте ваши заметки к под-сцене здесь..."
                    value={sub.comment || ''}
                    onChange={(e) => onCommentChange(scene.scene_id, sub.subscene_id, e.target.value)}
                    className="text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="sketches" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="sketches">Наброски</TabsTrigger>
                <TabsTrigger value="detailed">Детальные</TabsTrigger>
                <TabsTrigger value="animations">Анимации</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
                 {activeTab === 'sketches' && sketch && sketch.images.length > 0 && (
                    <>
                        <ViewSwitcher mode={sketchViewMode} onModeChange={onSketchViewModeChange} />
                        <Button onClick={onDownloadSelectedSketches} disabled={selectedSketchUrls.length === 0} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Скачать выбранные
                        </Button>
                    </>
                )}
                {activeTab === 'detailed' && detailedImages.length > 0 && (
                    <Button onClick={onAnimate} disabled={selectedForAnimation.length !== 2}>
                        <Film className="mr-2 h-4 w-4" />
                        Создать анимацию
                    </Button>
                )}
            </div>
        </div>

        <TabsContent value="sketches" className="mt-4">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Генерация набросков...</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    ИИ рисует, пожалуйста, подождите.
                </p>
            </div>
          ) : sketch && sketch.images.length > 0 ? (
            <>
              {sketchViewMode === 'carousel' && (
                <Carousel className="w-full group/carousel">
                  <CarouselContent className="-ml-2">
                      <CarouselItem className="pl-2 basis-auto">
                        <InsertButton onClick={() => onInsertSketch(0)} />
                      </CarouselItem>
                      {sketch.images.map((image, index) => (
                          <React.Fragment key={image.imageUrl + index}>
                            <CarouselItem className="pl-2 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <SketchCard
                                        scene={scene}
                                        image={image}
                                        index={index}
                                        isRegenerating={isRegenerating}
                                        selectedSketchUrls={selectedSketchUrls}
                                        onSelectSketch={onSelectSketch}
                                        editingState={editingState}
                                        handleRegenerateClick={handleRegenerateClick}
                                        toggleEdit={toggleEdit}
                                        onEnhance={onEnhance}
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem className="pl-2 basis-auto">
                              <InsertButton onClick={() => onInsertSketch(index + 1)} />
                            </CarouselItem>
                          </React.Fragment>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
              </Carousel>
              )}
               {sketchViewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* No insert buttons in grid view for simplicity for now */}
                    {sketch.images.map((image, index) => (
                        <SketchCard
                            key={image.imageUrl + index}
                            scene={scene}
                            image={image}
                            index={index}
                            isRegenerating={isRegenerating}
                            selectedSketchUrls={selectedSketchUrls}
                            onSelectSketch={onSelectSketch}
                            editingState={editingState}
                            handleRegenerateClick={handleRegenerateClick}
                            toggleEdit={toggleEdit}
                            onEnhance={onEnhance}
                        />
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Wand className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Наброски еще не созданы</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Нажмите кнопку, чтобы создать AI-наброски для этой сцены.
                </p>
                <Button className="mt-4" onClick={onGenerateSketch}>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать наброски
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
                                alt={`Детальное изображение для сцены ${scene.scene_id}`}
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
                            onClick={() => handleDownload(image.imageUrl, `scene-${scene.scene_id}-detailed-${image.id}.png`)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Скачать
                        </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Детальных изображений нет</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Улучшите набросок, чтобы сгенерировать ультра-реалистичное изображение.
                </p>
                <Button className="mt-4" onClick={() => onEnhance(scene.scene_id)} disabled={!sketch}>
                    <Plus className="mr-2 h-4 w-4" />
                    Улучшить набросок
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
                            <CardTitle>Сгенерированная анимация</CardTitle>
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
                                onClick={() => handleDownload(anim.imageUrl, `scene-${scene.scene_id}-animation-${anim.id}.gif`)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Скачать
                            </Button>
                         </CardFooter>
                    </Card>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Анимаций пока нет</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Выберите два детальных изображения для создания анимированного перехода.
                </p>
            </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
