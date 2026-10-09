# SFX credits

Action names live in `../sfx-library.json`. File ids are short descriptive names (in Portuguese,
from the library's first project); the action names are what films use.

## Committed files: Freesound, CC0 1.0

Each file here is a trimmed, mono 48 kHz, peak-normalised (-3 dBFS) mp3 cut from the Freesound
recording below, released under CC0 1.0 (public domain dedication, no attribution required). The
licences were read from the Freesound pages when the files were cut; check the page before you
redistribute a raw file elsewhere. Some ids share one recording (a different cut of it).

| id | source | licence |
|----|--------|---------|
| papel-pousar-mesa | https://freesound.org/s/473982/ | CC0 1.0 |
| livro-fechar-baque | https://freesound.org/s/319809/ | CC0 1.0 |
| livro-pousar | https://freesound.org/s/484906/ | CC0 1.0 |
| papel-rasgar-curto | https://freesound.org/s/487206/ | CC0 1.0 |
| papel-rasgar-longo | https://freesound.org/s/367684/ | CC0 1.0 |
| papel-amassar | https://freesound.org/s/334201/ | CC0 1.0 |
| papelao-pousar | https://freesound.org/s/346169/ | CC0 1.0 |
| fita-rasgar | https://freesound.org/s/467721/ | CC0 1.0 |
| pena-escrever | https://freesound.org/s/856167/ | CC0 1.0 |
| lapis-sublinhar | https://freesound.org/s/428338/ | CC0 1.0 |
| marcador-traco | https://freesound.org/s/351145/ | CC0 1.0 |
| carimbo-prensar | https://freesound.org/s/256763/ | CC0 1.0 |
| lacre-cera | https://freesound.org/s/759526/ | CC0 1.0 |
| tinta-gota | https://freesound.org/s/321490/ | CC0 1.0 |
| vela-acender | https://freesound.org/s/734665/ | CC0 1.0 |
| papel-queimar | https://freesound.org/s/528662/ | CC0 1.0 |
| impacto-grave-suave | https://freesound.org/s/336494/ | CC0 1.0 |
| sinos-distantes | https://freesound.org/s/703590/ | CC0 1.0 |
| igreja-ambiente | https://freesound.org/s/697579/ | CC0 1.0 |
| carimbo-tinta | https://freesound.org/s/683155/ | CC0 1.0 |
| adesivo-tapa | https://freesound.org/s/582469/ | CC0 1.0 |
| adesivo-descolar | https://freesound.org/s/137246/ | CC0 1.0 |
| postit-descolar | https://freesound.org/s/426264/ | CC0 1.0 |
| postit-descolar-2 | https://freesound.org/s/426264/ | CC0 1.0 |
| postit-colar | https://freesound.org/s/474580/ | CC0 1.0 |
| marcador-guincho | https://freesound.org/s/119153/ | CC0 1.0 |
| marcador-guincho-2 | https://freesound.org/s/335956/ | CC0 1.0 |
| marca-texto | https://freesound.org/s/655051/ | CC0 1.0 |
| marca-texto-2 | https://freesound.org/s/461809/ | CC0 1.0 |
| pena-riscar-curto | https://freesound.org/s/856167/ | CC0 1.0 |
| pena-riscar-longo | https://freesound.org/s/856167/ | CC0 1.0 |
| maquina-espaco | https://freesound.org/s/734318/ | CC0 1.0 |
| maquina-espaco-2 | https://freesound.org/s/734318/ | CC0 1.0 |
| maquina-carro-sino | https://freesound.org/s/345955/ | CC0 1.0 |
| papel-deslizar-madeira | https://freesound.org/s/464302/ | CC0 1.0 |
| papel-deslizar-madeira-2 | https://freesound.org/s/730078/ | CC0 1.0 |
| papel-cair-madeira | https://freesound.org/s/416416/ | CC0 1.0 |
| papel-cair-madeira-2 | https://freesound.org/s/272496/ | CC0 1.0 |
| papel-rasgar-3 | https://freesound.org/s/566199/ | CC0 1.0 |
| papel-rasgar-4 | https://freesound.org/s/366909/ | CC0 1.0 |
| livro-baque-madeira | https://freesound.org/s/824385/ | CC0 1.0 |
| mesa-batida | https://freesound.org/s/742356/ | CC0 1.0 |
| mesa-batida-2 | https://freesound.org/s/594389/ | CC0 1.0 |
| vidro-tinir | https://freesound.org/s/560298/ | CC0 1.0 |
| vidro-tinir-2 | https://freesound.org/s/104815/ | CC0 1.0 |
| vela-apagar | https://freesound.org/s/656818/ | CC0 1.0 |
| vela-apagar-2 | https://freesound.org/s/242867/ | CC0 1.0 |
| prato-reverso | https://freesound.org/s/774635/ | CC0 1.0 |
| orgao-acorde | https://freesound.org/s/808245/ | CC0 1.0 |
| coro-ah | https://freesound.org/s/444491/ | CC0 1.0 |
| adesivo-descolar-2 | https://freesound.org/s/137246/ | CC0 1.0 |

## Fetched files: Mixkit (never committed)

The Mixkit Sound Effects Free License (https://mixkit.co/license/#sfxFree) allows use in your
own productions but not redistribution of the files, so these are downloaded by
`node core/audio/fetch-sfx.mjs` into `sfx/fetched/` (gitignored), processed by the same recipe.
Their source URL, high-pass and length are in `../sfx-sources.json`. Five of them
(carimbo-madeira, carimbo-madeira-2, fosforo-chama, boom-grave, papel-passar-transicao) were
first made as a layer of a Freesound and a Mixkit recording; the fetched version is the Mixkit
layer alone. Until they are fetched, their actions fall back to synthesized voices.

| id | source |
|----|--------|
| papel-deslizar | https://assets.mixkit.co/active_storage/sfx/1530/1530-preview.mp3 |
| papel-cair-chao | https://assets.mixkit.co/active_storage/sfx/386/386-preview.mp3 |
| pagina-virar | https://assets.mixkit.co/active_storage/sfx/1104/1104-preview.mp3 |
| pagina-virar-grande | https://assets.mixkit.co/active_storage/sfx/1105/1105-preview.mp3 |
| livro-folhear | https://assets.mixkit.co/active_storage/sfx/1101/1101-preview.mp3 |
| papel-amassar-2 | https://assets.mixkit.co/active_storage/sfx/2996/2996-preview.mp3 |
| papel-farfalhar | https://assets.mixkit.co/active_storage/sfx/2380/2380-preview.mp3 |
| papel-vento | https://assets.mixkit.co/active_storage/sfx/2653/2653-preview.mp3 |
| caneta-riscar | https://assets.mixkit.co/active_storage/sfx/2367/2367-preview.mp3 |
| maquina-tecla | https://assets.mixkit.co/active_storage/sfx/1366/1366-preview.mp3 |
| maquina-teclas-rajada | https://assets.mixkit.co/active_storage/sfx/1379/1379-preview.mp3 |
| maquina-sino | https://assets.mixkit.co/active_storage/sfx/1368/1368-preview.mp3 |
| maquina-retorno | https://assets.mixkit.co/active_storage/sfx/1381/1381-preview.mp3 |
| liquido-despejar | https://assets.mixkit.co/active_storage/sfx/2826/2826-preview.mp3 |
| liquido-respingo | https://assets.mixkit.co/active_storage/sfx/1311/1311-preview.mp3 |
| agua-gota | https://assets.mixkit.co/active_storage/sfx/3179/3179-preview.mp3 |
| fosforo-riscar | https://assets.mixkit.co/active_storage/sfx/2590/2590-preview.mp3 |
| fogo-crepitar | https://assets.mixkit.co/active_storage/sfx/1329/1329-preview.mp3 |
| whoosh-curto | https://assets.mixkit.co/active_storage/sfx/1461/1461-preview.mp3 |
| whoosh-longo | https://assets.mixkit.co/active_storage/sfx/1474/1474-preview.mp3 |
| swish-pan | https://assets.mixkit.co/active_storage/sfx/3115/3115-preview.mp3 |
| riser-curto | https://assets.mixkit.co/active_storage/sfx/790/790-preview.mp3 |
| swell-reverso | https://assets.mixkit.co/active_storage/sfx/784/784-preview.mp3 |
| sino-igreja-unico | https://assets.mixkit.co/active_storage/sfx/619/619-preview.mp3 |
| assoalho-ranger | https://assets.mixkit.co/active_storage/sfx/337/337-preview.mp3 |
| porta-ranger | https://assets.mixkit.co/active_storage/sfx/195/195-preview.mp3 |
| porta-igreja | https://assets.mixkit.co/active_storage/sfx/193/193-preview.mp3 |
| clique-suave | https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3 |
| pop | https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3 |
| carimbo-madeira | https://assets.mixkit.co/active_storage/sfx/2182/2182-preview.mp3 |
| carimbo-madeira-2 | https://assets.mixkit.co/active_storage/sfx/2182/2182-preview.mp3 |
| maquina-tecla-2 | https://assets.mixkit.co/active_storage/sfx/1365/1365-preview.mp3 |
| maquina-tecla-3 | https://assets.mixkit.co/active_storage/sfx/1384/1384-preview.mp3 |
| maquina-tecla-4 | https://assets.mixkit.co/active_storage/sfx/1380/1380-preview.mp3 |
| maquina-carro-sino-2 | https://assets.mixkit.co/active_storage/sfx/1383/1383-preview.mp3 |
| papel-folhear-rapido | https://assets.mixkit.co/active_storage/sfx/1100/1100-preview.mp3 |
| papel-amassar-3 | https://assets.mixkit.co/active_storage/sfx/2389/2389-preview.mp3 |
| papel-amassar-4 | https://assets.mixkit.co/active_storage/sfx/2385/2385-preview.mp3 |
| fosforo-chama | https://assets.mixkit.co/active_storage/sfx/1345/1345-preview.mp3 |
| chama-whoosh | https://assets.mixkit.co/active_storage/sfx/1348/1348-preview.mp3 |
| camera-whoosh-grave | https://assets.mixkit.co/active_storage/sfx/2615/2615-preview.mp3 |
| swish-ar | https://assets.mixkit.co/active_storage/sfx/1489/1489-preview.mp3 |
| swish-giro | https://assets.mixkit.co/active_storage/sfx/1493/1493-preview.mp3 |
| riser-suave | https://assets.mixkit.co/active_storage/sfx/1445/1445-preview.mp3 |
| boom-grave | https://assets.mixkit.co/active_storage/sfx/2900/2900-preview.mp3 |
| papel-passar-transicao | https://assets.mixkit.co/active_storage/sfx/1469/1469-preview.mp3 |
| sino-grave-unico | https://assets.mixkit.co/active_storage/sfx/587/587-preview.mp3 |

## Processing

High-pass at 100 Hz (60 Hz for the deep bell, boom and deep whoosh) to drop handling rumble, mono
48 kHz, leading silence trimmed to 6 ms before the onset (-32 dB below the clip's peak), length
capped (hits 0.1-1.5 s, beds and bells up to 4.5 s) with a fade-out, peak-normalised to -3 dBFS,
mp3 96 kbps. Quiet crinkles (papel-amassar-3/4, maquina-tecla-4) get a soft tanh drive before
normalising so the body is not buried under the spikes.

## Sampler

`node core/audio/sfx/sampler.mjs [--out dir]` writes `sampler.mp3` (the first variant of every
action, in library order) and `sampler.txt` (time, action, file) into `./out` by default.
