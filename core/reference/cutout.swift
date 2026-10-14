// Cuts a reference image into a collage piece: a PNG with transparency, optionally with a
// paper border (the white edge left by scissors). Runs locally on macOS (Vision + Core Image),
// nothing is downloaded.
//
//   swift core/reference/cutout.swift <in> <out.png> [--mode subject|paper|instances] [--border px]
//
//   --mode subject  (default) lifts the foreground subject: a person, a statue, a building, an object.
//   --mode paper    keys out the paper of an engraving, woodcut or printed page: ink stays, paper
//                   goes transparent (the piece then sits on any ground, like a cut print).
//   --mode instances  writes no PNG: <out> is a .json with each foreground instance's outline as a
//                   clipping region ({ regions: [{ id, poly }] }, u,v in 0..1, top-left origin),
//                   to paste into a catalog entry and hand-edit.
//   --border px     adds a paper-coloured border of px around the cut shape (0 = none).
import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation
import ImageIO
import UniformTypeIdentifiers
import Vision

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write(Data("cutout: \(msg)\n".utf8))
  exit(1)
}

var args = Array(CommandLine.arguments.dropFirst())
func option(_ name: String, _ fallback: String) -> String {
  guard let i = args.firstIndex(of: "--\(name)"), i + 1 < args.count else { return fallback }
  let v = args[i + 1]
  args.removeSubrange(i...(i + 1))
  return v
}
let mode = option("mode", "subject")
let border = Double(option("border", "0")) ?? 0
guard args.count == 2 else {
  fail("usage: swift cutout.swift <in> <out.png|out.json> [--mode subject|paper|instances] [--border px]")
}
let (input, output) = (URL(fileURLWithPath: args[0]), URL(fileURLWithPath: args[1]))
guard let source = CIImage(contentsOf: input, options: [.applyOrientationProperty: true]) else {
  fail("cannot read \(input.path)")
}
let context = CIContext()

func subject(_ image: CIImage) -> CIImage {
  let request = VNGenerateForegroundInstanceMaskRequest()
  let handler = VNImageRequestHandler(ciImage: image)
  do { try handler.perform([request]) } catch { fail("vision: \(error)") }
  guard let result = request.results?.first, !result.allInstances.isEmpty else {
    fail("no subject found in \(input.lastPathComponent); try --mode paper")
  }
  do {
    let buffer = try result.generateMaskedImage(
      ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
    return CIImage(cvPixelBuffer: buffer)
  } catch { fail("mask: \(error)") }
}

func paper(_ image: CIImage) -> CIImage {
  // Darkness becomes alpha: ink (dark) opaque, paper (light) transparent. Levels push the
  // paper's off-white fully clear and the ink fully solid.
  let mono = image.applyingFilter("CIPhotoEffectMono")
  let ink = mono.applyingFilter("CIColorInvert").applyingFilter(
    "CIColorControls", parameters: [kCIInputContrastKey: 2.2, kCIInputBrightnessKey: -0.25])
  let alpha = ink.applyingFilter("CIMaskToAlpha")
  return mono.applyingFilter(
    "CIBlendWithAlphaMask",
    parameters: [kCIInputBackgroundImageKey: CIImage.empty(), kCIInputMaskImageKey: alpha])
}

// Outline of one instance mask: the largest contour, simplified until it fits `maxPoints`.
func outline(of mask: CVPixelBuffer, maxPoints: Int = 40) -> [[Double]]? {
  let request = VNDetectContoursRequest()
  request.detectsDarkOnLight = false  // the mask is white on black
  request.contrastAdjustment = 1
  do { try VNImageRequestHandler(cvPixelBuffer: mask).perform([request]) } catch { fail("contours: \(error)") }
  func area(_ c: VNContour) -> Double {
    let p = c.normalizedPoints
    var a = 0.0
    for i in 0..<p.count {
      let (q, r) = (p[i], p[(i + 1) % p.count])
      a += Double(q.x * r.y - r.x * q.y)
    }
    return abs(a) / 2
  }
  guard let largest = request.results?.first?.topLevelContours.max(by: { area($0) < area($1) })
  else { return nil }
  var epsilon: Float = 0.004
  var simplified = try? largest.polygonApproximation(epsilon: epsilon)
  while let s = simplified, s.pointCount > maxPoints, epsilon < 0.5 {
    epsilon *= 1.3
    simplified = try? largest.polygonApproximation(epsilon: epsilon)
  }
  guard var points = simplified?.normalizedPoints, points.count >= 3 else { return nil }
  // Epsilon is capped, so a very busy outline can still be over budget: thin it evenly.
  if points.count > maxPoints {
    points = (0..<maxPoints).map { points[$0 * points.count / maxPoints] }
  }
  // Vision is bottom-left; the catalog is top-left. Keep u,v inside 0..1 (contours can touch
  // the border by a rounding hair).
  func unit(_ v: Double) -> Double { min(1, max(0, v)) }
  return points.map { [unit(Double($0.x)), unit(1 - Double($0.y))] }
}

func instances(_ image: CIImage) {
  let request = VNGenerateForegroundInstanceMaskRequest()
  let handler = VNImageRequestHandler(ciImage: image)
  do { try handler.perform([request]) } catch { fail("vision: \(error)") }
  guard let result = request.results?.first, !result.allInstances.isEmpty else {
    fail("no subject found in \(input.lastPathComponent)")
  }
  var regions: [[String: Any]] = []
  for index in result.allInstances.sorted() {
    do {
      let mask = try result.generateScaledMaskForImage(forInstances: IndexSet(integer: index), from: handler)
      guard let poly = outline(of: mask) else {
        FileHandle.standardError.write(Data("cutout: instance \(index) skipped (no usable outline)\n".utf8))
        continue
      }
      regions.append(["id": "i\(regions.count + 1)", "poly": poly])
    } catch { fail("mask: \(error)") }
  }
  guard !regions.isEmpty else { fail("no outline found in \(input.lastPathComponent)") }
  do {
    let data = try JSONSerialization.data(withJSONObject: ["regions": regions], options: [.sortedKeys])
    try data.write(to: output)
  } catch { fail("cannot write \(output.path)") }
  print("cutout: instances → \(output.path) (\(regions.count) region\(regions.count == 1 ? "" : "s"))")
  exit(0)
}

if mode == "instances" { instances(source) }

var piece = mode == "paper" ? paper(source) : subject(source)

if border > 0 {
  // The cut shape grown by `border`, filled with paper colour, under the piece.
  let shape = piece.applyingFilter("CIColorMatrix", parameters: [
    "inputRVector": CIVector(x: 0, y: 0, z: 0, w: 0), "inputGVector": CIVector(x: 0, y: 0, z: 0, w: 0),
    "inputBVector": CIVector(x: 0, y: 0, z: 0, w: 0), "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 1),
    "inputBiasVector": CIVector(x: 0.96, y: 0.94, z: 0.89, w: 0),
  ])
  let grown = shape.applyingFilter("CIMorphologyMaximum", parameters: [kCIInputRadiusKey: border])
  piece = piece.composited(over: grown)
}

// Crop to the visible piece plus the border, so the PNG has no empty margin.
let extent = source.extent.insetBy(dx: -border, dy: -border)
guard let cg = context.createCGImage(piece, from: extent) else { fail("render failed") }
let bounds = opaqueBounds(cg)
guard let cropped = cg.cropping(to: bounds) else { fail("empty cutout") }
guard let dest = CGImageDestinationCreateWithURL(output as CFURL, UTType.png.identifier as CFString, 1, nil)
else { fail("cannot write \(output.path)") }
CGImageDestinationAddImage(dest, cropped, nil)
guard CGImageDestinationFinalize(dest) else { fail("cannot write \(output.path)") }
print("cutout: \(mode)\(border > 0 ? " +\(Int(border))px border" : "") → \(output.path) (\(cropped.width)×\(cropped.height))")

// Bounding box of pixels with alpha > 8, in image coordinates (top-left origin).
func opaqueBounds(_ image: CGImage) -> CGRect {
  let (w, h) = (image.width, image.height)
  var data = [UInt8](repeating: 0, count: w * h * 4)
  let ctx = CGContext(
    data: &data, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(image, in: CGRect(x: 0, y: 0, width: w, height: h))
  var (minX, minY, maxX, maxY) = (w, h, -1, -1)
  for y in 0..<h {
    for x in 0..<w where data[(y * w + x) * 4 + 3] > 8 {
      minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
    }
  }
  if maxX < 0 { return .zero }
  return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
}
