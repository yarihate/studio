export type SubScene = {
  subscene_id: string;
  description: string;
  emotion: string;
  camera_hint: string;
  props: string[];
  dialogue_excerpt: string;
  comment?: string;
};

export type Scene = {
  scene_id: string;
  scene_title: string;
  time_period: string;
  characters: string[];
  general_context: string;
  location: {
    place: string;
    environment: string;
  };
  subscenes: SubScene[];
  comment?: string;
};

export interface SketchImage {
  imageUrl: string;
  prompt: string;
}

export interface Sketch {
  sceneId: string;
  images: SketchImage[];
}

export interface DetailedImage {
  id: number;
  sceneId: string;
  imageUrl: string;
}

export interface Animation {
  id: number;
  sceneId: string;
  imageUrl: string;
}
