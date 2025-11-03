
export type Subject = {
  name?: string | null;
  description?: string | null;
  wardrobe?: string | null;
};

export type SceneDetails = {
  description?: string | null;
  shot: {
    composition?: string | null;
    camera_motion?: string | null;
  };
  subjects?: Subject[] | null;
  scene: {
    location?: string | null;
    time_of_day?: string | null;
    environment?: string | null;
  };
  visual_details: {
    action?: string | null;
    props?: string | null;
  };
  cinematography: {
    lighting?: string | null;
    tone?: string | null;
  };
};

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
