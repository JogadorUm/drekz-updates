#!/usr/bin/env python3
"""Uso: python3 publicar.py BUILD VERSAO "notas"
Gera versao.json para o drekz-tv.js desta pasta. BUILD deve ser maior que o anterior."""
import json, sys
b, v, n = int(sys.argv[1]), sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""
s = open("drekz-tv.js", encoding="utf-8").read()
t = len(s.encode("utf-16-le")) // 2  # tamanho em unidades UTF-16, como o JS conta
json.dump({"build": b, "versao": v, "notas": n, "arquivo": "drekz-tv.js", "tamanho": t},
          open("versao.json", "w", encoding="utf-8"), ensure_ascii=False)
print("ok", b, v, t)
