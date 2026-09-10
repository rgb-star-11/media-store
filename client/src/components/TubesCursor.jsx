import React, { useEffect, useRef } from 'react';

export default function TubesCursor({ isGlobal = false, configStr = '' }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  const randomColors = (count) => {
    return new Array(count)
      .fill(0)
      .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
  };

  useEffect(() => {
    let parsedConfig = null;
    if (configStr) {
      try {
        parsedConfig = JSON.parse(configStr);
      } catch (e) {
        console.warn("Invalid tubesConfig JSON, using default", e);
      }
    }

    const options = parsedConfig || {
      tubes: {
        colors: ["#5e72e4", "#8965e0", "#f5365c"],
        lights: {
          intensity: 200,
          colors: ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"]
        }
      }
    };

    const initTimer = setTimeout(() => {
      import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')
        .then(module => {
          const TubesCursorFn = module.default;
          if (canvasRef.current) {
            const app = TubesCursorFn(canvasRef.current, options);
            appRef.current = app;
          }
        })
        .catch(err => console.error("Failed to load TubesCursor module:", err));
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (appRef.current && typeof appRef.current.dispose === 'function') {
        appRef.current.dispose();
      }
    };
  }, [configStr]);

  const handleClick = () => {
    if (appRef.current && appRef.current.tubes) {
      try {
        const newTubeColors = randomColors(3);
        const newLightColors = randomColors(4);
        if (typeof appRef.current.tubes.setColors === 'function') {
          appRef.current.tubes.setColors(newTubeColors);
        }
        if (typeof appRef.current.tubes.setLightsColors === 'function') {
          appRef.current.tubes.setLightsColors(newLightColors);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={isGlobal ? "fixed inset-0 z-0 overflow-hidden pointer-events-auto" : "absolute inset-0 z-0 overflow-hidden pointer-events-auto"}
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
    </div>
  );
}
