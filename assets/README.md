# assets — public-domain fixtures for the technique demos

Public-domain / CC0 only. No AI images, no brand material. Images are resized (long side at most 2000 px, jpg) from the Commons originals; cut-outs are made locally with `tools/kit/reference/cutout.swift` (Apple Vision, `--mode subject`). Attribution is not legally required for PD/CC0 but is kept here for provenance.

## Images — `img/`

| File | Source (Commons file page) | Author | Licence | Notes |
|---|---|---|---|---|
| dore-moses-sinai.jpg | https://commons.wikimedia.org/wiki/File:039.Moses_Comes_Down_from_Mount_Sinai.jpg | Gustave Doré (1866) | Public domain | Steel-style engraving, dark ground, 1700 px |
| durer-four-riders.jpg | https://commons.wikimedia.org/wiki/File:Durer_Revelation_Four_Riders.jpg | Albrecht Dürer (1498) | Public domain | Woodcut, dense hatching; texture / displacement tests |
| durer-virgin-st-john.jpg | https://commons.wikimedia.org/wiki/File:Albrecht_Dürer,_The_Virgin_Appearing_to_Saint_John,_1510-1511,_NGA_846.jpg | Albrecht Dürer (1511) | CC0 (National Gallery of Art open access) | Title page with calligraphic lettering; scene in the lower half |
| ortelius-1572-world-map.jpg | https://commons.wikimedia.org/wiki/File:1572_Typus_Orbis_Terrarum_Ortelius.jpg | Abraham Ortelius (1572) | Public domain | The old map; pan / zoom tests |
| piranesi-campo-vaccino.jpg | https://commons.wikimedia.org/wiki/File:Forum_Romanum_te_Rome_Veduta_di_Campo_Vaccino_(titel_op_object)_Gezichten_op_Rome_(serietitel)_Vedute_di_Roma_disegnate_ed_incise_da_Giambattista_Piranesi_architetto_Ve(nez)iano_(serietitel),_RP-P-OB-39.335.jpg | Giovanni Battista Piranesi (18th c.), scan Rijksmuseum | CC0 | Architecture; wide etching |
| merian-alsatiae.jpg | https://commons.wikimedia.org/wiki/File:Topographia_Alsatiae_(Merian)_p_013.JPG | Matthäus Merian / Martin Zeiller (1644) | Public domain | Town view / architecture, 1700 px |
| gutenberg-genesis.jpg | https://commons.wikimedia.org/wiki/File:Gutenberg_Bible_B42_Genesis.JPG | Johannes Gutenberg (printer); scan by Jossi (facsimile of the Berlin copy) | Public domain | Manuscript-style printed page; scan of a facsimile of the 1455 original (Commons tags it public domain, PD-old) |
| schedel-tiburtine-sibyl.jpg | https://commons.wikimedia.org/wiki/File:Nuremberg_Chronicle_-_Tiburtine_Sibyl_(XCIIIv)_edit.jpg | Michael Wolgemut, Wilhelm Pleydenwurff (1493) | Public domain | Hand-coloured woodcut |
| figure-jager.jpg | https://commons.wikimedia.org/wiki/File:Koninklijke_Jager,_BI-B-FM-123-41.jpg | Anonymous, *Koninklijke Jager* (19th c., hand-coloured print), Rijksmuseum | CC0 (Rijksmuseum; Commons licence CC0, no further permission note) | Soldier on plain paper, 2000 px; source of the puppet |
| figure-cavalier.jpg | https://commons.wikimedia.org/wiki/File:Staande_man_in_kostuum,_RP-P-OB-24.082.jpg | Anonymous (17th c. costume etching, series with monogram N.G.), Rijksmuseum | CC0 (Rijksmuseum; Commons licence CC0, no further permission note) | Full-length standing man, 1300 px |
| figure-walker.jpg | https://commons.wikimedia.org/wiki/File:Staande_man_met_stok,_RP-P-OB-24.080.jpg | Anonymous (17th c. costume etching, same series), Rijksmuseum | CC0 (Rijksmuseum; Commons licence CC0, no further permission note) | Full-length man with a staff, 1300 px |
| figure-mode1660.jpg | https://commons.wikimedia.org/wiki/File:Staande_man,_gekleed_volgens_de_mode_omstreeks_1660,_RP-P-2002-434.jpg | Anonymous (c. 1660 fashion engraving), Rijksmuseum | CC0 (Rijksmuseum; Commons licence CC0, no further permission note) | Full-length man, hand on hip, 1300 px |


## Cut-outs — `cut/`

All transparent PNG, cut from the images above.

| File | Cut from | Notes |
|---|---|---|
| cut-figure-cavalier.png | figure-cavalier.jpg | Full figure |
| cut-figure-walker.png | figure-walker.jpg | Full figure, staff included |
| cut-figure-mode1660.png | figure-mode1660.jpg | Full figure |
| cut-moses.png | dore-moses-sinai.jpg | Figure with tablets; light rays above the head are kept |
| cut-virgin.png | durer-virgin-st-john.jpg | Lower half only (scene); small hole in the cloud, Vision's mask |
| cut-sibyl.png | schedel-tiburtine-sibyl.jpg | Right-hand pair of women, cropped from a larger group; kept coloured |
| puppet-torso.png, puppet-head.png, puppet-upper_arm_l.png, puppet-lower_arm_l.png, puppet-upper_arm_r.png, puppet-lower_arm_r.png | figure-jager.jpg | Rig parts; `puppet.json` lists `part`, `file`, `pivot` (px inside that part's PNG), `parent`, plus `origin` (top-left of the part in the assembled 341x886 figure). Parts overlap about 7 px at the joints; the torso is filled with paper colour where an arm was lifted out (coat colour), so rotating an arm shows no hole. Left/right are the figure's, seen from the viewer: `_l` is on the viewer's left. |

## Fonts — `fonts/`

| File | Source | Author | Licence | Notes |
|---|---|---|---|---|
| UnifrakturCook-Bold.ttf | https://github.com/google/fonts/tree/main/ofl/unifrakturcook | j. 'mach' wust, Peter Wiegel | SIL OFL 1.1 (`OFL-UnifrakturCook.txt`) | Blackletter display |
| JetBrainsMono-VF.ttf | https://github.com/google/fonts/tree/main/ofl/jetbrainsmono | The JetBrains Mono Project Authors | SIL OFL 1.1 (`OFL-JetBrainsMono.txt`) | Mono, variable weight (file is `JetBrainsMono[wght].ttf` upstream) |

## Audio — `audio/`

Music bed: `tools/assets/make-bed.sh` → `bed-01.wav` (licence: generated, ffmpeg-synthesized pad; 48 kHz stereo, 20 s; gitignored).

VO: generated by `tools/assets/make-vo.sh` (licence: generated, macOS `say -v Daniel`; 48 kHz mono). `*.wav` is gitignored: run the script to recreate `vo-01.wav` to `vo-03.wav`.
