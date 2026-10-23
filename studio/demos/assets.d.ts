// Asset imports resolved by the Remotion bundler (asset/resource rules for fonts, audio, images).
declare module "*.ttf" { const url: string; export default url; }
declare module "*.wav" { const url: string; export default url; }
declare module "*.jpg" { const url: string; export default url; }
declare module "*.png" { const url: string; export default url; }
declare module "*.words.json" {
  const words: { words: { w: string; s: number; e: number }[] };
  export default words;
}
