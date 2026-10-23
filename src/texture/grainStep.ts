// Pure step logic for <Grain>: which noise "deal" a frame shows. Pure in (frame, fps, stepFps),
// so a seek or a paused still lands on the same grain whatever was rendered before.

/** Index of the noise deal shown at `frame`: constant for a whole step of 1/stepFps seconds. */
export const grainStep = (frame: number, fps: number, stepFps: number): number => {
  if (!(fps > 0)) throw new Error(`grain: fps must be positive, got ${fps}`);
  if (!(stepFps > 0)) throw new Error(`grain: stepFps must be positive, got ${stepFps}`);
  return Math.floor((frame * stepFps) / fps + 1e-6);
};

/**
 * Integer seed for the noise effect at `frame`. Different steps give different seeds; the same
 * step (and `seed`) always gives the same one. Seeds are kept in 0..9999 for the shader.
 */
export const grainSeed = (frame: number, fps: number, stepFps: number, seed = 0): number => {
  const step = grainStep(frame, fps, stepFps);
  const mixed = Math.imul(step + 1, 0x9e3779b1) ^ Math.imul(Math.trunc(seed) + 1, 0x85ebca6b);
  return (mixed >>> 0) % 10000;
};
