// shutterAngle (degrees) per px/frame of camera velocity, and its ceiling: a whip smears but
// never melts the frame into a wash.
const BLUR_GAIN = 2.2;
const BLUR_MAX_ANGLE = 120;

/** Motion-blur shutter angle (degrees) for a camera velocity in px/frame. */
export const shutterAngleFor = (velocity: number): number => Math.min(BLUR_MAX_ANGLE, velocity * BLUR_GAIN);
