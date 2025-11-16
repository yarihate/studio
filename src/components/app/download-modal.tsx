'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DownloadCloud, Loader2 } from 'lucide-react';
import type { DownloadOptions, DownloadFormat, DownloadContent } from '@/types/script-vision';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: DownloadOptions) => void;
  isLoading: boolean;
}

export function DownloadModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: DownloadModalProps) {
  const [format, setFormat] = useState<DownloadFormat>('zip');
  const [content, setContent] = useState<DownloadContent[]>(['sketches', 'medium-detailed', 'highly-detailed']);

  const handleContentChange = (item: DownloadContent) => {
    setContent(prev =>
      prev.includes(item)
        ? prev.filter(c => c !== item)
        : [...prev, item]
    );
  };
  
  const handleSubmit = () => {
    if (content.length > 0) {
      onSubmit({ format, content });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Options</DialogTitle>
          <DialogDescription>
            Choose what you want to download and in which format.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          
          {/* Content Selection */}
          <div className="space-y-3">
            <Label className="font-semibold">Content</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="content-sketches"
                  checked={content.includes('sketches')}
                  onCheckedChange={() => handleContentChange('sketches')}
                />
                <Label htmlFor="content-sketches" className="font-normal">Sketches</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="content-medium-detailed"
                  checked={content.includes('medium-detailed')}
                  onCheckedChange={() => handleContentChange('medium-detailed')}
                />
                <Label htmlFor="content-medium-detailed" className="font-normal">Medium Detailed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="content-highly-detailed"
                  checked={content.includes('highly-detailed')}
                  onCheckedChange={() => handleContentChange('highly-detailed')}
                />
                <Label htmlFor="content-highly-detailed" className="font-normal">Highly Detailed</Label>
              </div>
            </div>
          </div>
          
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="font-semibold">Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value: DownloadFormat) => setFormat(value)}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="format-png" />
                <Label htmlFor="format-png" className="font-normal">PNG</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpg" id="format-jpg" />
                <Label htmlFor="format-jpg" className="font-normal">JPG</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zip" id="format-zip" />
                <Label htmlFor="format-zip" className="font-normal">ZIP</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Selecting PNG or JPG will download files individually. ZIP will package them together.
            </p>
          </div>

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading || content.length === 0}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DownloadCloud className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
