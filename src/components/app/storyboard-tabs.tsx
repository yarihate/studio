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
import { Download, Plus, Wand, Loader2, Camera, User, Clock, Drama, Quote, MapPin, Edit, RefreshCw, MessageSquare, DownloadCloud, Image as ImageIcon } from 'lucide-react';
import type {
  Scene,
  Sketch,
  SketchViewMode,
} from '@/types/script-vision';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ViewSwitcher } from '../ui/view-switcher';

type StoryboardTabsProps = {
  scene: Scene | undefined;
  sketch: Sketch | undefined;
  detailedImages: Sketch | undefined;
  isLoadingSketches: boolean;
  isLoadingDetailed: boolean;
  isRegenerating: string | null;
  onGenerateSketch: () => void;
  onGenerateDetailed: () => void;
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

const ImageCard = ({ scene, image, index, isRegenerating, selectedSketchUrls, onSelectSketch, editingState, handleRegenerateClick, toggleEdit, cardType = 'sketch' }: any) => {
    const isCurrentlyRegenerating = isRegenerating === image.imageUrl;
    const subsceneId = scene.subscenes[index]?.subscene_id || `Вставка ${index}`;
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-2 text-center bg-muted">
                <p className="text-xs font-semibold truncate">Под-сцена {subsceneId}</p>
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
                        alt={`Изображение для под-сцены ${subsceneId}`}
                        width={480}
                        height={480}
                        className={`h-full w-full object-cover ${isCurrentlyRegenerating ? 'blur-sm' : ''}`}
                        data-ai-hint={`${cardType} image`}
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
            {editingState?.imageUrl === image.imageUrl && cardType === 'sketch' && (
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
            <CardFooter className="p-4 grid grid-cols-1 gap-2">
                 {cardType === 'sketch' ? (
                    <Button onClick={() => toggleEdit(image.imageUrl, image.prompt)} variant="secondary" className="w-full" disabled={isCurrentlyRegenerating}>
                        <Edit className="mr-2 h-4 w-4" />
                        {editingState?.imageUrl === image.imageUrl ? 'Закрыть' : 'Редактировать'}
                    </Button>
                 ) : (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                             const link = document.createElement('a');
                             link.href = image.imageUrl;
                             link.download = `scene-${scene.scene_id}-detailed-${index}.png`;
                             document.body.appendChild(link);
                             link.click();
                             document.body.removeChild(link);
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Скачать
                    </Button>
                 )}
            </CardFooter>
        </Card>
    );
};


export function StoryboardTabs({
  scene,
  sketch,
  detailedImages,
  isLoadingSketches,
  isLoadingDetailed,
  isRegenerating,
  onGenerateSketch,
  onGenerateDetailed,
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
  const hasDetailedImages = detailedImages && detailedImages.images.length > 0;
  const canDownloadScene = hasSketches || hasDetailedImages;

  const LoadingPlaceholder = ({ title, description }: { title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );

  const EmptyState = ({ title, description, buttonText, onClick, icon: Icon }: { title: string; description: string; buttonText: string; onClick: () => void; icon: React.ElementType }) => (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
        <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button className="mt-4" onClick={onClick}>
            <Plus className="mr-2 h-4 w-4" />
            {buttonText}
        </Button>
    </div>
  );


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
                <TabsTrigger value="detailed">Детализированные</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
                 {(activeTab === 'sketches' && hasSketches) || (activeTab === 'detailed' && hasDetailedImages) && (
                    <>
                        <ViewSwitcher mode={sketchViewMode} onModeChange={onSketchViewModeChange} />
                        <Button onClick={onDownloadSelectedSketches} disabled={selectedSketchUrls.length === 0} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Скачать выбранные
                        </Button>
                    </>
                )}
            </div>
        </div>

        <TabsContent value="sketches" className="mt-4">
          {isLoadingSketches ? (
             <LoadingPlaceholder title="Генерация набросков..." description="ИИ рисует, пожалуйста, подождите." />
          ) : hasSketches ? (
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
                                    <ImageCard
                                        scene={scene}
                                        image={image}
                                        index={index}
                                        isRegenerating={isRegenerating}
                                        selectedSketchUrls={selectedSketchUrls}
                                        onSelectSketch={onSelectSketch}
                                        editingState={editingState}
                                        handleRegenerateClick={handleRegenerateClick}
                                        toggleEdit={toggleEdit}
                                        cardType="sketch"
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
                    {sketch.images.map((image, index) => (
                        <ImageCard
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
                            cardType="sketch"
                        />
                    ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState 
                title="Наброски еще не созданы"
                description="Нажмите кнопку, чтобы создать AI-наброски для этой сцены."
                buttonText="Создать наброски"
                onClick={onGenerateSketch}
                icon={Wand}
            />
          )}
        </TabsContent>

        <TabsContent value="detailed" className="mt-4">
           {isLoadingDetailed ? (
             <LoadingPlaceholder title="Генерация детализированных изображений..." description="ИИ создает фотореалистичные кадры, это может занять время." />
          ) : hasDetailedImages ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {detailedImages.images.map((image, index) => (
                    <ImageCard
                        key={image.imageUrl + index}
                        scene={scene}
                        image={image}
                        index={index}
                        isRegenerating={isRegenerating}
                        selectedSketchUrls={selectedSketchUrls}
                        onSelectSketch={onSelectSketch}
                        editingState={null} // No editing for detailed images
                        handleRegenerateClick={() => {}}
                        toggleEdit={() => {}}
                        cardType="detailed"
                    />
                ))}
             </div>
          ) : (
            <EmptyState 
                title="Детализированных изображений нет"
                description="Нажмите кнопку, чтобы сгенерировать фотореалистичные изображения."
                buttonText="Создать детализированные изображения"
                onClick={onGenerateDetailed}
                icon={ImageIcon}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
