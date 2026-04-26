#!/bin/bash
# Configura Nginx + TLS para os três serviços do CadernEdu.
# Chama o add-nginx-app.sh existente uma vez por serviço.
#
# Uso:
#   ./setup-nginx-cadernedu.sh <vm_ip> [dominio_base]
#
# Exemplos:
#   ./setup-nginx-cadernedu.sh 192.168.105.50
#   ./setup-nginx-cadernedu.sh 192.168.105.50 cadernedu.ioda.com.br
#
# Pré-requisito: add-nginx-app.sh já deve existir em /usr/local/bin/ ou no PATH.

set -e

VM_IP="$1"
BASE_DOMAIN="${2:-cadernedu.ioda.com.br}"

if [ -z "$VM_IP" ]; then
  echo "Uso: $0 <vm_ip> [dominio_base]"
  echo "Exemplo: $0 192.168.105.50 cadernedu.ioda.com.br"
  exit 1
fi

SCRIPT="$(command -v add-nginx-app.sh 2>/dev/null || echo /usr/local/bin/add-nginx-app.sh)"

if [ ! -x "$SCRIPT" ]; then
  echo "Erro: add-nginx-app.sh não encontrado ou sem permissão de execução."
  echo "Certifique-se de que o script está em /usr/local/bin/ e é executável."
  exit 1
fi

echo "========================================"
echo " CadernEdu — Setup Nginx"
echo " VM:     $VM_IP"
echo " Domínio base: $BASE_DOMAIN"
echo "========================================"
echo

# ── Landing (web_site) ──────────────────────────────────────────────────────
echo ">>> [1/3] Landing: $BASE_DOMAIN → $VM_IP:3000"
"$SCRIPT" "$BASE_DOMAIN" http "$VM_IP" 3000

# ── API ─────────────────────────────────────────────────────────────────────
echo ">>> [2/3] API: api.$BASE_DOMAIN → $VM_IP:8000"
"$SCRIPT" "api.$BASE_DOMAIN" http "$VM_IP" 8000

# ── Painel ──────────────────────────────────────────────────────────────────
echo ">>> [3/3] Painel: painel.$BASE_DOMAIN → $VM_IP:3001"
"$SCRIPT" "painel.$BASE_DOMAIN" http "$VM_IP" 3001

echo
echo "========================================"
echo " Pronto!"
echo
echo "  https://$BASE_DOMAIN          → landing"
echo "  https://api.$BASE_DOMAIN      → API + Swagger (/docs)"
echo "  https://painel.$BASE_DOMAIN   → painel do professor"
echo "========================================"
