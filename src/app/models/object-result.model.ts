export interface ObjectDetectionResult {
    // The name or label of the detected object
    objectName: string;

    // Confidence score of the detection (0-1)
    confidence: number;

    // Bounding box coordinates
    boundingBox: {
        x: number;      // Top-left x coordinate
        y: number;      // Top-left y coordinate
        width: number;  // Width of the box
        height: number; // Height of the box
    };

    // Timestamp of when the object was detected
    timestamp: Date;

    // Additional metadata about the detected object (optional)
    metadata?: {
        category?: string;    // Category of the object (e.g., "vehicle", "person", "animal")
        color?: string;       // Dominant color if detected
        size?: string;        // Estimated size (e.g., "small", "medium", "large")
        distance?: number;    // Estimated distance from camera if available
    };
}
