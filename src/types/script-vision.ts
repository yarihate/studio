export type SubScene = {
  subscene_id: string;
  description: string;
  emotion: string;
  camera_hint: string;
  props: string[];
  dialogue_excerpt: string;
};

export type Scene = {
  scene_id: string;
  scene_title: string;
  time_period: string;
  characters: string[];
  general_context: string;
  subscenes: SubScene[];
};

export interface Sketch {
  sceneId: string;
  imageUrls: string[];
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
