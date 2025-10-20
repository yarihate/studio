import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Scene } from '@/types/script-vision';
import { Download, Film } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

type ScenesSidebarProps = {
  scenes: Scene[];
  selectedSceneId: number | null;
  onSelectScene: (id: number) => void;
};

export function ScenesSidebar({
  scenes,
  selectedSceneId,
  onSelectScene,
}: ScenesSidebarProps) {
  const { toast } = useToast();
  const handleDownloadProject = () => {
    toast({
      title: "Feature not available",
      description: "Downloading the entire project is not yet implemented.",
    });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold font-headline">Scenes</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {scenes.map((scene) => (
            <SidebarMenuItem key={scene.id}>
              <SidebarMenuButton
                onClick={() => onSelectScene(scene.id)}
                isActive={selectedSceneId === scene.id}
                className="h-auto py-2"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">Scene {scene.id}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {scene.description}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={handleDownloadProject} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Project
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
