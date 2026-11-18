#!/bin/bash
# Klik dua kali berkas ini untuk menjalankan situs di komputer sendiri.
# Tidak ada yang diunggah ke internet: server hanya berjalan di localhost.
cd "$(dirname "$0")" || exit 1

PORT=8080
while lsof -i ":$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 tidak ditemukan. Pasang Python 3, atau jalankan dengan server statis lain."
  read -r -p "Tekan Enter untuk menutup."
  exit 1
fi

echo "ALPRO R Learning Hub"
echo "Membuka http://localhost:$PORT ..."
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
sleep 1
open "http://localhost:$PORT" 2>/dev/null || echo "Buka manual: http://localhost:$PORT"
echo ""
echo "Situs berjalan. Tutup jendela Terminal ini (atau tekan Ctrl+C) untuk menghentikan server."
trap 'kill $SRV 2>/dev/null' EXIT INT TERM
wait $SRV
