import { AbsoluteFill } from "remotion";
import { Piece, ramp, useRefFrame } from "../lib/kit";
import { Region, whiteGround } from "../lib/b06-09-parts";
import womanUrl from "../assets/pd/P08-regency-woman-jdm-1815.jpg";
import dandyUrl from "../assets/gen/P08b-dandy-cut.png";
import milkUrl from "../assets/pd/P09-milk-seller-pails-wellcome.jpg";
import basketUrl from "../assets/pd/P10-cries-rowlandson-artichokes.jpg";

// Shots 8-10 (reference f325-404, 13.50-16.79 s): 8 the Regency couple on a white ground, slow push
// 1.0 -> 1.08, the couple rises (f325-354); 9 the milk seller, pails already yellow, slides right to left
// (f355-368, woman centred by f361); 10 the basket woman slides over at f369, basket yellow, push
// 1.0 -> 1.075 with dx -5 % (f371-404). Local t = reference frame - 325.
// The found plates are not cut out: each woman is a feathered crop of her plate on the white ground.

const Couple: React.FC<{ t: number }> = ({ t }) => {
  const rise = ramp(t, 0, 29, 5, 0);
  return (
    <AbsoluteFill style={{ transform: `scale(${ramp(t, 0, 29, 1, 1.08)})`, transformOrigin: "50% 65%" }}>
      <Region src={womanUrl} aspect={1920 / 3295} crop={[0.36, 0.21, 0.28, 0.6]} cx={27} cy={50 + rise} w={46} feather={26} blend="multiply" grade="contrast(2.1) brightness(0.92)" />
      <Piece src={dandyUrl} x={62} y={56 + rise} w={48} />
    </AbsoluteFill>
  );
};

const Milk: React.FC<{ x: number }> = ({ x }) => (
  <Region
    src={milkUrl} aspect={1600 / 2228} crop={[0.45, 0.08, 0.45, 0.82]} cx={x} cy={50} w={66} ellipse
    tint={1} tintRect={[0.34, 0.72, 0.84, 0.98]}
  />
);

const Basket: React.FC<{ t: number }> = ({ t }) => {
  const push = ramp(t, 46, 79, 1, 1.075);
  const dx = ramp(t, 46, 79, 0, -5);
  return (
    <AbsoluteFill style={{ transform: `translateX(${dx}%) scale(${push})` }}>
      <Region
        src={basketUrl} aspect={1596 / 1920} crop={[0.5, 0.18, 0.34, 0.66]} cx={52} cy={50} w={68} ellipse
        tint={1} tintRect={[0.22, 0.52, 1, 0.72]}
      />
    </AbsoluteFill>
  );
};

export const B07: React.FC = () => {
  const t = useRefFrame();
  const milkX = ramp(t, 30, 43, 70, 58, "out");
  const slide = ramp(t, 43, 46, 100, 0, "out"); // basket woman slides over from the right at f369
  return (
    <AbsoluteFill style={whiteGround}>
      {t < 30 ? <Couple t={t} /> : null}
      {t >= 30 && t < 47 ? <Milk x={milkX} /> : null}
      {t >= 43 ? (
        <AbsoluteFill style={{ transform: `translateX(${slide}%)`, ...whiteGround }}>
          <Basket t={t} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
