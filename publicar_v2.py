#!/usr/bin/env python3
"""Uso: python3 publicar_v2.py BUILD VERSAO "notas"  (BUILD >= 101, sempre crescente)
Publica v2/drekz2.js (já copiado) em v2/versao.json e oferece o app novo na Samsung via versao.json."""
import json, sys
b, v, n = int(sys.argv[1]), sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""
s = open("v2/drekz2.js", encoding="utf-8").read()
t = len(s.encode("utf-16-le")) // 2
d = {"build": b, "versao": v, "notas": n, "arquivo": "drekz2.js", "tamanho": t}
json.dump(d, open("v2/versao.json", "w", encoding="utf-8"), ensure_ascii=False)
r = json.load(open("versao.json", encoding="utf-8")); r["v2"] = d
json.dump(r, open("versao.json", "w", encoding="utf-8"), ensure_ascii=False)
print("ok v2", b, v, t)
