import React, { useState, useEffect, memo } from 'react';

const SysReadyCounter = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return <>SYS.RDY // {progress}%</>;
};

export default memo(SysReadyCounter);
