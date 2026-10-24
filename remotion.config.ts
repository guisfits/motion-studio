// Studio and CLI render settings. The Node render APIs ignore this file: pass the same options
// to them directly. https://remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// @remotion/effects and @remotion/three need WebGL; without ANGLE headless Chromium drops them.
Config.setChromiumOpenGlRenderer("angle");
// 4 Chromium tabs, not half the cores (9 on an 18-core Mac): full-res 9:16 layers in 9 tabs plus
// image/music generation exhausted 64 GB (S5). Pass --concurrency to override for a final.
Config.setConcurrency(4);
