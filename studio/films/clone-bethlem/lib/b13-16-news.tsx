import { Img } from "remotion";
import { FONT } from "./kit";
import norrisUrl from "../assets/pd/P20-norris-cruikshank.jpg";

// An 1815-style broadsheet built in code (no found page exists, lettering is never generated):
// masthead, three columns of grey filler type, the Norris engraving between them.
export const PAGE_W = 950;
export const PAGE_H = 1325;

const SENTENCES = [
  "The Committee of the House of Commons appointed to inquire into the state of madhouses have laid their Report upon the table.",
  "It was found that the unhappy man had been confined for upwards of twelve years in a cell of the said Hospital.",
  "An iron ring about his neck was connected by a short chain to a stancheon, which slid upon an upright bar.",
  "The keeper declared before the Committee that he considered such restraint necessary to the safety of the House.",
  "Several Gentlemen of the Committee were pleased to examine the apparatus with their own hands.",
  "The Governors have since acknowledged the facts, and promise that a remedy shall be sought without delay.",
  "Subscriptions for the relief of the poor lunatics of this metropolis may be left at the usual places.",
  "Further particulars will appear in our next; meanwhile the engraving here given is taken from a drawing made on the spot.",
];

const Column: React.FC<{ n: number; style: React.CSSProperties }> = ({ n, style }) => (
  <div style={{ position: "absolute", overflow: "hidden", fontFamily: FONT, fontSize: 13.5, lineHeight: "16px", textAlign: "justify", color: "#3a3a38", hyphens: "auto", ...style }}>
    {Array.from({ length: n }, (_, i) => SENTENCES[i % SENTENCES.length]).join(" ")}
  </div>
);

export const NewsPage: React.FC = () => (
  <div style={{ position: "relative", width: PAGE_W, height: PAGE_H, backgroundColor: "#DEDEDB", boxShadow: "0 0 40px rgba(0,0,0,0.25)", fontFamily: FONT, color: "#222" }}>
    <div style={{ position: "absolute", top: 34, left: 0, right: 0, textAlign: "center", fontSize: 50, fontWeight: 700, letterSpacing: 4 }}>PORTRAIT OF WILLIAM NORRIS</div>
    <div style={{ position: "absolute", top: 100, left: 70, right: 70, textAlign: "center", fontSize: 14, lineHeight: "17px", color: "#3a3a38" }}>
      As he appeared in Bethlem Hospital, from a drawing taken in the year 1814, by G. Arnald, Esq. — Published for the Proprietors, London, 1815.
      <br />The engraving represents the unfortunate man as he has been confined for upwards of twelve years.
    </div>
    <div style={{ position: "absolute", top: 150, left: 40, right: 40, borderTop: "3px double #444" }} />
    <Column n={14} style={{ top: 170, left: 40, width: 135, height: 760 }} />
    <Img src={norrisUrl} style={{ position: "absolute", top: 170, left: 195, width: 540, height: 640, objectFit: "contain", objectPosition: "50% 0", filter: "url(#mono)" }} />
    <div style={{ position: "absolute", top: 816, left: 195, width: 540, textAlign: "center", fontSize: 13, fontStyle: "italic" }}>William Norris, as he appeared in the Hospital of Bethlem.</div>
    <Column n={16} style={{ top: 170, left: 755, width: 155, height: 760 }} />
    <Column n={8} style={{ top: 840, left: 195, width: 540, height: 95 }} />
    <div style={{ position: "absolute", top: 945, left: 40, right: 40, borderTop: "1px solid #666" }} />
    <Column n={20} style={{ top: 960, left: 40, width: 270, height: 320 }} />
    <Column n={20} style={{ top: 960, left: 340, width: 270, height: 320 }} />
    <Column n={20} style={{ top: 960, left: 640, width: 270, height: 320 }} />
  </div>
);
