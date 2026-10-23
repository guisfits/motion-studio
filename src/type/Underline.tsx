import { Stroke, type StrokeProps } from "./Stroke";

/** Underline drawn under a word, left to right; one pass by default so it reads as a rule. */
export const Underline: React.FC<Omit<StrokeProps, "y">> = ({ passes = 2, ...props }) => (
  <Stroke y={0.98} passes={passes} {...props} />
);
