# Third-party notices

Parts of the engine are adapted from **lemomo-ai/lemo-opuscar** (https://github.com/lemomo-ai/lemo-opuscar), under the MIT licence:

| File | Adapted from |
|---|---|
| `retro.js` | cel-shading core, `limb()`, flare values (`styles/cel-anime-80s`: `cel.js`, `rider.js`, `fx.js`, `head80.js`) |
| `anime.js` | `head80()` head, eye and hair construction (`styles/cel-anime-80s/demo/head80.js`) |
| `post.js` | WebGL2 CRT/VHS post pass (`core/post/crt.js`) |
| `pxfont.js` | pixel font glyphs (`styles/pixel-rpg/demo/font.js`, original to that repo) |

No upstream images, fonts, music, samples or voices are used. The chiptune score and SFX are synthesised in `audio.js`. The voiceover is generated with Microsoft Edge neural TTS through `edge-tts` (`make_voice.py`).

```
MIT License

Copyright (c) 2026 LemoLab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
