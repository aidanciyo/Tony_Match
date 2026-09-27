#!/usr/bin/env bash
# Publica la app en un servidor web por SSH, dentro de una carpeta llamada Tony_Match.
#
# Uso:     ./desplegar.sh usuario@servidor [carpeta_web] [clave_ssh]
# Ejemplo: ./desplegar.sh admin@apps.micentro.es /var/www/html ~/.ssh/servidor-apps
#
#   carpeta_web  Carpeta pública del servidor web (por defecto /var/www/html).
#   clave_ssh    Clave privada para entrar por SSH (opcional).
#
# Resultado: <carpeta_web>/Tony_Match, visible en http(s)://tu-servidor/Tony_Match/
set -euo pipefail

destino="${1:?Indica el servidor, por ejemplo: ./desplegar.sh usuario@servidor}"
web="${2:-/var/www/html}"
clave="${3:-}"
carpeta="${web%/}/Tony_Match"

ssh_opts=(-o StrictHostKeyChecking=accept-new)
if [ -n "$clave" ]; then
  ssh_opts+=(-i "$clave")
fi

cd "$(dirname "$0")"
archivos=(index.html manifest.webmanifest css js assets)

echo "Subiendo la app a $destino:$carpeta ..."
# Se empaqueta en local y se descomprime en el servidor: solo hace falta ssh y tar.
tar -czf - "${archivos[@]}" | ssh "${ssh_opts[@]}" "$destino" \
  "mkdir -p '$carpeta' && tar -xzf - -C '$carpeta' && chmod -R a+rX '$carpeta'"

echo "Listo. Abre http(s)://<tu-servidor>/Tony_Match/ (según cómo publique tu servidor esa carpeta)."
