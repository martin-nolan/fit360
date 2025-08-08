import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  thumbnail?: string;
}

interface ProgressPhotosProps {
  photos?: ProgressPhoto[];
  onUpload?: (file: File) => void;
}

export function ProgressPhotos({ photos = [], onUpload }: ProgressPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload?.(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentIndex = selectedPhoto 
    ? sortedPhotos.findIndex(p => p.id === selectedPhoto.id)
    : -1;

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(sortedPhotos.length - 1, currentIndex + 1);
      
    setSelectedPhoto(sortedPhotos[newIndex]);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-health animate-metric-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Progress Photos
            </CardTitle>
            <Badge variant="secondary">
              {photos.length} photos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full mb-4 bg-gradient-primary hover:opacity-90"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Photo
          </Button>

          {/* Photo Timeline */}
          {sortedPhotos.length > 0 && (
            <div className="timeline-scroll overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {sortedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={cn(
                      "flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                      selectedPhoto?.id === photo.id 
                        ? "border-primary shadow-glow" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={`Progress photo from ${photo.date}`}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="p-1 bg-card/90 backdrop-blur">
                      <p className="text-xs text-center">
                        {new Date(photo.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {sortedPhotos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No progress photos yet</p>
              <p className="text-sm">Upload your first photo to start tracking your journey</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Photo Viewer */}
      {selectedPhoto && (
        <Card className="shadow-metric animate-metric-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigatePhoto('prev')}
                  disabled={currentIndex <= 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigatePhoto('next')}
                  disabled={currentIndex >= sortedPhotos.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              <img
                src={selectedPhoto.url}
                alt={`Progress photo from ${selectedPhoto.date}`}
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}