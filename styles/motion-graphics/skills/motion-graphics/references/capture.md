# Capturing the product: a real person using the real thing

When a film shows a product it stays sober: a **recording of real gestures**, the finger (or
cursor) visible, the whole screen inside a device frame. Screenshots remain for stills only (a
poster frame, a lock-up).

## Setup

1. A build with clean, realistic data (seeded, never production, never real customers' data).
2. A booted simulator/emulator or a browser at the target size. Clean status bar on iOS:
   `xcrun simctl status_bar booted override --time "9:41" --dataNetwork wifi --wifiBars 3
   --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100`.
3. **Touch indicators on** (iOS: a touch-visualiser in the debug build; Android:
   `adb shell settings put system show_touches 1`; web: a visible cursor). Check them on the
   take's contact sheet: a take with no visible touch while the screen changes is re-recorded.
4. Record each feature in every theme and device kind the film may use, so consecutive films
   can vary light/dark and device bodies.

## Rehearse, then one take per shot

1. Write the take as a list of gestures: "tap X, wait, slow scroll to Y, tap Y, wait". One take =
   one shot of the film, 3–8 s.
2. Reach the start state by deep link or URL, not by long navigation the film does not show.
   On Android, force-stop the app first: a running app restores its last route and ignores links.
3. Rehearse until every screen the gestures pass through reads clean.
4. Record: `xcrun simctl io booted recordVideo --codec=h264 --force rec/<shot>.mov` (stop with
   SIGINT), `adb shell screenrecord --bit-rate 12000000 /sdcard/<shot>.mp4` (max 180 s), or a
   browser capture.
5. Gestures read like a person: a tap held ~0.12 s; scrolls slow and eased (a fast swipe flings
   past the target); ~1 s between actions so the eye follows the finger.
6. Extract frames: `node <E>/core/reference/clip.mjs rec/<shot>.mov assets/clip-<shot> --fps 60
   [--from s --to s]`. Keep the recording; the frames are rebuilt.

## Inspect every take

Contact sheet of the take (`core/critique/sheets.mjs rec/<shot>.mov`), read every frame.
Re-record when it shows: placeholder or test data, a truncated title, a loading state, a toast or
keyboard, contradictory counts, debug chrome, a missing touch, a bounce or fling past the target,
text in the wrong language. **Never film bad data**: fix it at the source and re-take; a crop
does not hide it.

## Using a take

```js
const take = makeClip(stage, "assets/clip-search");
const phone = makePhone(stage, { width: 620, screens: [take], kind: "iphone" });
// draw(t): take.at(t - T.searchIn); phone.el.style.transform = `translate(...) rotateY(...) scale(...)`;
```

- Play at 1× to 1.5×. The screen is never cropped by layout or cut into pieces.
- Two takes join by the product's own navigation (`push` when the app really navigates that way)
  or by a camera move; never a crossfade of two screens, never a jump cut inside a recording.
- An Android body holds an Android take, never an iOS screen in an Android frame.
