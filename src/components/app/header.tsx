'use client';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

export function AppHeader() {
  const { toast } = useToast();

  const handleDownloadProject = () => {
    toast({
      title: "Feature not available",
      description: "Downloading the entire project is not yet implemented.",
    });
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">ScriptVision AI</h1>
      </div>
      <Button onClick={handleDownloadProject}>
        <Download className="mr-2 h-4 w-4" />
        Download Project
      </Button>
    </header>
  );
}
