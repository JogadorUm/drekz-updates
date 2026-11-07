#!/usr/bin/env python3
"""Uso: python3 publicar_box.py CODIGO VERSAO "notas"  (CODIGO = versionCode do APK do Box = numero da execucao + 100)"""
import json, sys, os
c, v, n = int(sys.argv[1]), sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""
json.dump({"codigo": c, "versao": v, "notas": n, "arquivo": "apk/DrekzTV-Box.apk", "tamanho": os.path.getsize("apk/DrekzTV-Box.apk")},
          open("apk/box.json", "w", encoding="utf-8"), ensure_ascii=False)
print("ok", c, v)
