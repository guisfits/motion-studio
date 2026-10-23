import { Stroke, type StrokeProps } from "./Stroke";

/** Strike-through drawn over a word (the "correction" beat); mid-height, 3 passes. */
export const Strike: React.FC<Omit<StrokeProps, "y">> = (props) => <Stroke y={0.52} {...props} />;
