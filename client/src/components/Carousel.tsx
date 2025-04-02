import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselImage {
  url: string;
  alt: string;
}

interface CarouselProps {
  images: CarouselImage[];
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  height?: string;
}

const Carousel = ({
  images,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  height = "400px",
}: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (interval > 0) {
      autoplayRef.current = setInterval(() => {
        moveToNextSlide();
      }, interval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [currentSlide, interval]);

  const moveToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const moveToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-xl`} style={{ height }}>
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {images.map((image, index) => (
          <div 
            key={index}
            className="w-full flex-shrink-0 h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${image.url}')` }}
          >
            <div className="bg-black bg-opacity-50 h-full flex items-center justify-center">
              <div className="text-center text-white px-4">
                {index === 0 && (
                  <>
                    <h1 className="text-4xl font-bold mb-4">Welcome to BEST</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                      Help us improve your hostel mess experience by providing feedback
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showControls && (
        <>
          <button 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 focus:outline-none"
            onClick={moveToPrevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 focus:outline-none"
            onClick={moveToNextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {showIndicators && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button 
              key={index}
              className={`h-2 w-8 bg-white rounded-full ${
                index === currentSlide ? 'opacity-100' : 'opacity-50'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
