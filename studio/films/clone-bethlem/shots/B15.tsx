import { YearsCard } from "../lib/b13-16-years";
import { useRefFrame } from "../lib/kit";

// Shot 15 (reference f1089-1140, 45.3-47.5 s): pale card with the hospital ghosted at 12 %, no bar.
// "It took another" (f1089-1100), then the year counter rolls 1814 -> 1852 (f1101-1122, linear: the
// reference reads 1830 at f1110), then "years" under it from f1125 (breakdown 6.3 card C).
// The card itself lives in lib/b13-16-years.tsx so B16's peel can paint it underneath.
export const B15: React.FC = () => <YearsCard t={useRefFrame()} />;
