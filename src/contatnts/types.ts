export interface Boundary {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface ImageItem {
    id: number;
    created_at: string;
    name: string;
    image_uri: string;
    marks: Boundary[];
    description?: string;
}