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

type ScenesSidebarProps = {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  onDownloadProject: () => void;
};

export function ScenesSidebar({
  scenes,
  selectedSceneId,
  onSelectScene,
  onDownloadProject,
}: ScenesSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold font-headline">Сцены</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {scenes.map((scene) => (
            <SidebarMenuItem key={scene.scene_id}>
              <SidebarMenuButton
                onClick={() => onSelectScene(scene.scene_id)}
                isActive={selectedSceneId === scene.scene_id}
                className="h-auto py-2"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">Сцена {scene.scene_id}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {scene.scene_title}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={onDownloadProject} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Project
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
