// Studio and CLI render settings. The Node render APIs ignore this file: pass the same options
// to them directly. https://remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// @remotion/effects and @remotion/three need WebGL; without ANGLE headless Chromium drops them.
Config.setChromiumOpenGlRenderer("angle");
