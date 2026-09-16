import React, {useState, useEffect} from 'react';

interface DynamicLoaderProps {
  image: string;
}

const DynamicLoader: React.FC<DynamicLoaderProps> = ({image}) => {
  const [loaded, setLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    // Always show loader briefly for smooth experience
    const timer = setTimeout(() => setShowImage(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!image || !showImage) return;

    const img = new Image();
    img.onload = () => {
      setLoaded(true);
    };
    img.onerror = () => {
      setLoaded(true); // Still proceed even if error
    };
    img.src = image.startsWith('data:') ? image : image;
  }, [image, showImage]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
      }}
    >
      {/* Animated Loader */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#000',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              border: '4px solid #333',
              borderTop: '4px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}

      {/* Zooming Image */}
      <img
        src={image}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(0.8)',
          transition:
            'opacity 0.8s ease, transform 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
          display: 'block',
        }}
      />

      {/* Global animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default DynamicLoader;
