import { useEffect } from 'react';

const useScrollToTop = (dependency) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Thêm animation mượt mà
    });
  }, [dependency]);
};

export default useScrollToTop; 