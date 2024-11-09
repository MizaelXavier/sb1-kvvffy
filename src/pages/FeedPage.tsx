import React, { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import VideoPlayer from '../components/VideoPlayer';
import { useVideoStore } from '../store/videoStore';

const FeedPage = () => {
  const videos = useVideoStore((state) => state.videos);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeThreshold = 800; // ms between scroll actions
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let touchStartTime = 0;

    const scrollToNextVideo = (direction: number) => {
      const now = Date.now();
      if (isScrollingRef.current || now - lastScrollTime.current < scrollTimeThreshold) return;
      
      isScrollingRef.current = true;
      lastScrollTime.current = now;
      
      const videoHeight = window.innerHeight;
      const currentScroll = container.scrollTop;
      const currentVideoIndex = Math.round(currentScroll / videoHeight);
      const targetScroll = (currentVideoIndex + direction) * videoHeight;
      
      // Ensure we don't scroll beyond bounds
      if (targetScroll < 0 || targetScroll > (videos.length - 1) * videoHeight) {
        isScrollingRef.current = false;
        return;
      }

      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(8);
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, scrollTimeThreshold);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      scrollToNextVideo(direction);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToNextVideo(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToNextVideo(1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isScrollingRef.current) return;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      const timeDiff = Date.now() - touchStartTime;
      
      // More precise touch detection
      if (Math.abs(deltaY) > 40 && timeDiff < 300) {
        e.preventDefault();
        const direction = deltaY > 0 ? 1 : -1;
        scrollToNextVideo(direction);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [videos.length]);
  
  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center px-4 text-center">
        <p className="text-gray-400">No videos available. Check back later!</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-scroll overscroll-y-contain touch-pan-y"
      style={{ 
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth'
      }}
    >
      {videos.map((video, index) => (
        <VideoContainer key={video.id} video={video} isFirstVideo={index === 0} />
      ))}
    </div>
  );
};

interface VideoContainerProps {
  video: {
    id: string;
    url: string;
    createdAt: number;
  };
  isFirstVideo: boolean;
}

const VideoContainer = ({ video, isFirstVideo }: VideoContainerProps) => {
  const { ref, inView } = useInView({
    threshold: 0.7,
    rootMargin: '-10% 0px',
  });

  return (
    <div
      ref={ref}
      className="h-screen w-full relative bg-black flex items-center justify-center"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
    >
      <VideoPlayer 
        src={video.url} 
        isVisible={inView} 
        defaultMuted={isFirstVideo}
      />
    </div>
  );
};

export default FeedPage;