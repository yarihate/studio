export interface Scene {
  id: number;
  description: string;
}

export interface Sketch {
  sceneId: number;
  imageUrl: string;
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
