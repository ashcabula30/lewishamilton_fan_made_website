import { useEffect, useState } from 'react';

export type BlobCursorPosition = {
  x: number;
  y: number;
};

declare global {
  interface WindowEventMap {
    'blobcursor:move': CustomEvent<BlobCursorPosition>;
  }
}

export const useBlobCursorPosition = () => {
  const [position, setPosition] = useState<BlobCursorPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event: WindowEventMap['blobcursor:move']) => {
      setPosition(event.detail);
    };

    window.addEventListener('blobcursor:move', handleMove);

    return () => {
      window.removeEventListener('blobcursor:move', handleMove);
    };
  }, []);

  return position;
};
