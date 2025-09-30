
export default function throttle<F extends (...args: any[]) => void>(func: F, limit: number) {
  let inThrottle = false;
  return function (this: any, ...args: Parameters<F>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as F;
}
