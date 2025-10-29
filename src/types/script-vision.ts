import { z } from 'zod';

export const SubjectSchema = z.object({
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  wardrobe: z.string().optional().nullable(),
});

export const SceneDetailsSchema = z.object({
  description: z.string().optional().nullable(),
  shot: z.object({
    composition: z.string().optional().nullable(),
    camera_motion: z.string().optional().nullable(),
  }),
  subjects: z.array(SubjectSchema).optional().nullable(),
  scene: z.object({
    location: z.string().optional().nullable(),
    time_of_day: z.string().optional().nullable(),
    environment: z.string().optional().nullable(),
  }),
  visual_details: z.object({
    action: z.string().optional().nullable(),
    props: z.string().optional().nullable(),
  }),
  cinematography: z.object({
    lighting: z.string().optional().nullable(),
    tone: z.string().optional().nullable(),
  }),
});

export type SceneDetails = z.infer<typeof SceneDetailsSchema>;

export interface Scene {
  id: number;
  details: SceneDetails;
}

export interface Sketch {
  sceneId: number;
  imageUrls: string[];
}

export interface DetailedImage {
  id: number;
  sceneId: number;
  imageUrl: string;
}

export interface Animation {
  id: number;
  sceneId: number;
  imageUrl: string;
}
