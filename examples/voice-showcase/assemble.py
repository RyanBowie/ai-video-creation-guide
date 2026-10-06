"""Assembles voice-showcase.html from the microsoft-model-hub player shell plus the scene code in src/p1-p4.js.

Usage:  python assemble.py
Edit src/p*.js (helpers + data, relay/title, roll-call cards, wall/finale/outro + timeline), then re-run.
"""
import io, os
HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, "..", "..", "skills", "motion-graphics", "template", "microsoft-model-hub.html")
L = io.open(TPL, encoding="utf-8").read().split("\n")
head = L[:164]  # doc shell, CSS, logo defs and shared helpers (ease, springs, words, mark ...)
head[4] = "<title>Voice Showcase — one sentence, eight free AI voices</title>"
ai = next(i for i, x in enumerate(L) if x.startswith("const AU = {"))  # audio engine + player controls
parts = "".join(io.open(os.path.join(HERE, "src", f"p{i}.js"), encoding="utf-8").read() + "\n" for i in range(1, 5))
out = "\n".join(head) + "\n" + parts + "\n" + "\n".join(L[ai:])
io.open(os.path.join(HERE, "voice-showcase.html"), "w", encoding="utf-8", newline="\n").write(out)
print("wrote voice-showcase.html", len(out), "chars")
