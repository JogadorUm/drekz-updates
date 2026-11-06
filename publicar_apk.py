#!/usr/bin/env python3
"""Uso: python3 publicar_apk.py CODIGO VERSAO "notas"   (CODIGO = versionCode do APK = numero da execucao + 100)
Gera apk/connect.json para o apk/DrekzConnect.apk desta pasta."""
import json, sys, os
c, v, n = int(sys.argv[1]), sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""
json.dump({"codigo": c, "versao": v, "notas": n, "arquivo": "apk/DrekzConnect.apk",
           "tamanho": os.path.getsize("apk/DrekzConnect.apk")},
          open("apk/connect.json", "w", encoding="utf-8"), ensure_ascii=False)
print("ok", c, v)
