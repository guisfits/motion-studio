# clone-bethlem: public-domain pictures (gitignored jpgs; re-fetch from these pages)

Wellcome images: `https://iiif.wellcomecollection.org/image/<id>/full/1600,/0/default.jpg`; licence line = catalogue API `license.id = pdm` (Public Domain Mark 1.0), checked per item.
Commons images: `Special:FilePath/<file>?width=1600`; licence line = Commons `LicenseShortName`, Permission field empty in every case.
Generate rows live in `../prompts.json` (never generated here). Every file was looked at.

| P | file | what it is | source page | licence line as read | verdict |
| --- | --- | --- | --- | --- | --- |
| P1 | P01-victoria-tower-rijks.jpg | 1860s stereograph, Victoria Tower of the Houses of Parliament with trees (crop one half; yellow mount to remove) | https://commons.wikimedia.org/wiki/File:Gezicht_op_de_Victoria_Tower_van_de_House_of_Parliament_in_Londen_House_of_Parliament-Victoria_Tower_(titel_op_object),_RP-F-F05020.jpg (Rijksmuseum RP-F-F05020) | CC0 | found |
| P2 | P02-fashion-1841-loc.jpg | US fashion plate 1841, two rows of top-hatted men in frock coats, plus women and boys (cut out) | https://commons.wikimedia.org/wiki/File:Spring_and_summer_fashions_for_1841,_by_A.F._Saguezs_%26_G.C._Merrill,_25_Courtland-St.,_New-York,_agents_-_H.D._LCCN2006677664.jpg (Library of Congress LCCN2006677664) | Public domain | found |
| P3 | P03-hogarth-bedlam-wellcome.jpg | Hogarth, A Rake's Progress plate VIII (Bedlam), engraving | https://wellcomecollection.org/works/csnss76d (M0013877) | PDM (pdm) | found |
| P4 | P04b-bethlem-entrance-facade.jpg | New Bedlam in Moorfields, entrance facade with hedged garden and avenue, engraving by A. Soly. Best match for the wide prospect with hedges | https://wellcomecollection.org/works/n3n9s8bj (V0014724) | PDM (pdm) | found |
| P4 alt | P04-bethlem-north-engraving.jpg | "View of Bethlem Hospital, Moorfields", front elevation only (wide, short) | https://wellcomecollection.org/works/cmdr5w75 (V0013189) | PDM (pdm) | alt |
| P5 | P05-penny-1797-britannia-bnf.jpg | 1797 cartwheel penny, Britannia side, brown bronze, round (BnF scan) | https://commons.wikimedia.org/wiki/File:Monnaie_-_Royaume-Uni,_George_III,_Penny,_1797_-_btv1b113100001_(2_of_2).jpg | Public domain | found |
| P5 alt | P05x-penny-bnf-king-side.jpg | same coin, George III bust side | https://commons.wikimedia.org/wiki/File:Monnaie_-_Royaume-Uni,_George_III,_Penny,_1797_-_btv1b113100001_(1_of_2).jpg | Public domain | alt |
| P6, P7 | none | snowy Westminster crowd plate; P7 is a crop of the generated P6 | none usable: Pennell etching (NYPL) rejected, no Doré snow plate found on Commons/Wellcome in budget | n/a | generate |
| P8 | P08-regency-woman-jdm-1815.jpg | Regency woman in bonnet, Journal des Dames et des Modes 1815 (1501), full figure, hand-coloured plate (the woman only; the dandy is a generate piece P08b) | https://commons.wikimedia.org/wiki/File:Journal_des_Dames_et_des_Modes,_Costume_Parisien,_15_ao%C3%BBt_1815,_(1501)_Costume_d'une_jeune_personne.,_RP-P-2009-2440.jpg (Rijksmuseum) | CC0 | found (+ generate dandy P08b) |
| P8 alt | P08alt-regency-coat-jdm-1815.jpg | woman in coat seen from behind, 1815 (1462) | https://commons.wikimedia.org/wiki/File:Journal_des_Dames_et_des_Modes_vrouwenmode_Journal_des_Dames_et_des_Modes,_Costume_Parisien,_28_f%C3%A9vrier_1815,_(1462)_Robe_de_M%C3%A9rinos_(..),_RP-P-2009-2439.jpg | CC0 | alt |
| P9 | P09-milk-seller-pails-wellcome.jpg | Wheatley, "Milk below Maids", Cries of London plate 2: woman with shoulder yoke and two pails, lamp-post and building behind (coloured stipple) | https://wellcomecollection.org/works/bpzxeurz (V0039632) | PDM (pdm) | found |
| P9 alt | P09alt-cries-old-clothes.jpg | Rowlandson, Cries of London no. 7, old clothes sellers | https://commons.wikimedia.org/wiki/File:Thomas_Rowlandson_-_Set_of_eight_(7),_Cries_of_London_-_B1985.36.1423_-_Yale_Center_for_British_Art.jpg | CC0 | alt |
| P10 | P10-cries-rowlandson-artichokes.jpg | Rowlandson, Cries of London no. 5, woman with wicker basket of artichokes at a door, houses behind (no palms, no neoclassical building) | https://commons.wikimedia.org/wiki/File:Thomas_Rowlandson_-_Set_of_eight_(5),_Cries_of_London_-_B1985.36.1420_-_Yale_Center_for_British_Art.jpg (Yale Center for British Art) | CC0 | found (partial) |
| P11 | none | bald man with a ruff, hands clasped, vaulted room | no PD match in budget | n/a | generate |
| P12 | P12-bedlam-chained-raving-mad-plate-V0049186.jpg | "He is chained raving mad in Bedlam", Bedlam interior engraving with a cone-hat jester at the left, onlookers, women cradling a head, bowl on the floor. P12 jester, P17 women and P18 bowl are crops of this file or of P03 | https://wellcomecollection.org/works/grqt3wvq (V0049186) | PDM (pdm) | found (crop) |
| P13 | P03-hogarth-bedlam-wellcome.jpg (right edge) | fiddler with newspaper hat = crop of the Hogarth plate; the separate violin is a generate piece P13b | see P3 | PDM | found (crop) + generate violin |
| P14 | P14-bethlem-incurables-inspected.jpg | Rowlandson-style drawing "The Hospital for Lunatics": visitors inspecting chained patients in cell bays, sepia. Closest to the visiting crowd; not seen from behind | https://wellcomecollection.org/works/x7rf7y4e (L0031628) | PDM (pdm) | found (partial); P12 plate onlookers are the alternative |
| P15 | none | barred cell door in a stone wall | only a crop of the small barred door in P03 exists (too small) | n/a | generate |
| P16 | P20-norris-cruikshank.jpg | turbaned patient with iron harness on a bed in a cell (the Norris plate): crop the upper body | https://wellcomecollection.org/works/krmypwx6 (L0010941) | PDM (pdm) | found (crop of P20) |
| P17 | P12 plate (women at lower left) | women, one cradling a head | see P12; an Illustrated Times page of the Bethlem women's dormitory was rejected (newspaper text in frame, wrong scene) | PDM | found (crop) |
| P18 | P20 plate + P12 plate bowl | bust of a patient (P20 crop) and bowl on the floor (P12 plate bottom centre). Optional clean bowl: generate piece P18b | see P20, P12 | PDM | found (crop) |
| P19 | P19-constables-stovepipe-wellcome.jpg | two police constables in stovepipe hats at a counter, "The Telegraph Office" (cut out the pair; verse text and stain at the bottom to crop; no lantern, no light beam) | https://wellcomecollection.org/works/sss9reqj (V0025509) | PDM (pdm) | found |
| P20 | P20-norris-cruikshank.jpg | William/James Norris seated, collar, chain to a post, harness, ankle shackle, wood engraving signed "C. A. Ferrier" | https://wellcomecollection.org/works/krmypwx6 (L0010941) | PDM (pdm) | found |
| P21 | none | newspaper page "Portrait of William Norris" | Wellcome and Commons searches returned nothing | n/a | missing |
| P22 | none | crowd of top-hatted men with a newspaper sheet under a lamp (sheet = P21 skewed, so blank in the generation) | none | n/a | generate |
| P23 | P23-st-pauls-north-wellcome.jpg | "The North Prospect of the Cathedral Church of St Paul's", engraved elevation (backdrop; men line-ups come from P2) | https://wellcomecollection.org/works/ed9qev7n (L0021677) | PDM (pdm) | found |
| P24 | P24-lunacy-report-1852-title-wellcome.jpg | the actual title page: Observations of the Governors ... Commissioners in Lunacy ... Bethlem Hospital, Nov. 1852, yellowed paper, round "Medical Society of London" stamp | https://wellcomecollection.org/works/bbc4zcg7 (IIIF b30798474, canvas 1) | PDM (pdm; manifest license publicdomain/mark/1.0) | found |
| P25 | P25-paper-mottled-ambientcg-Paper003.jpg, P25-paper-fine-ambientcg-Paper001.jpg | 1K colour maps: mottled grey paper (Paper003), fine white paper (Paper001); tint to #DBDBD7 / #C9C9C6 in grade | https://ambientcg.com/view?id=Paper003 , https://ambientcg.com/view?id=Paper001 | CC0 1.0 (ambientCG) | found |

## Traps

- P20: the Wellcome record says "from etching by G. Cruikshank", the image is a later wood engraving signed C. A. Ferrier of the Norris cell scene. It matches the brief's pose (collar, chain to post, harness) and the harness patient P16 is the same picture.
- P5: the brief says "obverse with Britannia"; Britannia is the reverse of the 1797 penny. The Britannia file is the one to use; the king's bust is the alt.
- P8: the plate is a single woman; Regency couple needs the generated dandy (P08b) composited beside her.
- P1: the file is a stereograph pair on a yellow card with handwritten caption; crop one half.
- P19: constables are from a comic-verse print (text below, foxing stain); crop tight. No lantern or light beam, add in animation.
- P6/P7: Commons "Westminster Bridge or Westminster Clock Tower" (NYPL, Pennell etching) shows Big Ben but is a sketchy etching with a colour chart in frame; rejected.
- Wikimedia "Hogarth's Rake's Progress; scene at Bedlam" (Wellcome M0008974) is CC BY 4.0 and the British Museum "Mad in Bedlam" copy carries a CC BY-NC-SA line: both rejected; the PDM Wellcome M0013877 is used.
- The Met Open Access API returned HTTP 410 during the run, so the Met was not searched.
- P24 manifest b24748468 (the second Wellcome copy) is a blue wrapper without the stamp; the used copy is b30798474.
