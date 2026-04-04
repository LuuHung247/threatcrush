#!/bin/sh
set -e

# ThreatCrush installer
# Usage: curl -fsSL https://threatcrush.com/install.sh | sh

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
DIM="\033[2m"
RESET="\033[0m"

echo ""
echo "${GREEN}  ████████╗██╗  ██╗██████╗ ███████╗ █████╗ ████████╗${RESET}"
echo "${GREEN}  ╚══██╔══╝██║  ██║██╔══██╗██╔════╝██╔══██╗╚══██╔══╝${RESET}"
echo "${GREEN}     ██║   ███████║██████╔╝█████╗  ███████║   ██║   ${RESET}"
echo "${GREEN}     ██║   ██╔══██║██╔══██╗██╔══╝  ██╔══██║   ██║   ${RESET}"
echo "${GREEN}     ██║   ██║  ██║██║  ██║███████╗██║  ██║   ██║   ${RESET}"
echo "${GREEN}     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝${RESET}"
echo "${DIM}                    C R U S H${RESET}"
echo ""

# ─── Detect environment ───

detect_pm() {
  if command -v pnpm >/dev/null 2>&1; then echo "pnpm"
  elif command -v yarn >/dev/null 2>&1; then echo "yarn"
  elif command -v npm >/dev/null 2>&1; then echo "npm"
  elif command -v bun >/dev/null 2>&1; then echo "bun"
  else echo ""; fi
}

detect_node() {
  if command -v node >/dev/null 2>&1; then node --version; else echo ""; fi
}

has_docker() {
  command -v docker >/dev/null 2>&1
}

NODE_VERSION=$(detect_node)
PM=$(detect_pm)
HAS_DOCKER=$(has_docker && echo "yes" || echo "no")

echo "  ${DIM}Node.js:${RESET} ${NODE_VERSION:-not found}"
echo "  ${DIM}Docker:${RESET}  ${HAS_DOCKER}"
echo ""

# ─── Choose install method ───

INSTALL_METHOD=""

if [ -n "$NODE_VERSION" ] && [ "$HAS_DOCKER" = "yes" ]; then
  # Both available — ask
  echo "${YELLOW}How would you like to install ThreatCrush?${RESET}"
  echo ""
  echo "  ${GREEN}1)${RESET} Native install (npm/pnpm/yarn/bun) ${DIM}— recommended${RESET}"
  echo "  ${GREEN}2)${RESET} Docker container"
  echo ""
  printf "  Choose [1/2]: "
  
  # Handle piped input (curl | sh) — default to native
  if [ -t 0 ]; then
    read -r CHOICE
  else
    CHOICE="1"
    echo "1 ${DIM}(auto-selected for non-interactive)${RESET}"
  fi

  case "$CHOICE" in
    2) INSTALL_METHOD="docker" ;;
    *) INSTALL_METHOD="native" ;;
  esac
elif [ -n "$NODE_VERSION" ]; then
  INSTALL_METHOD="native"
elif [ "$HAS_DOCKER" = "yes" ]; then
  echo "${DIM}No Node.js found. Installing via Docker...${RESET}"
  INSTALL_METHOD="docker"
else
  echo "${RED}Neither Node.js nor Docker found.${RESET}"
  echo ""
  echo "Install one of:"
  echo "  ${GREEN}Node.js:${RESET} curl -fsSL https://fnm.vercel.app/install | bash && fnm install --lts"
  echo "  ${GREEN}Docker:${RESET}  https://docs.docker.com/get-docker/"
  echo ""
  exit 1
fi

# ─── Native install ───

install_native() {
  PM=$(detect_pm)
  echo ""

  case "$PM" in
    pnpm)
      echo "${GREEN}→ Installing via pnpm...${RESET}"
      pnpm add -g @profullstack/threatcrush
      ;;
    yarn)
      echo "${GREEN}→ Installing via yarn...${RESET}"
      yarn global add @profullstack/threatcrush
      ;;
    bun)
      echo "${GREEN}→ Installing via bun...${RESET}"
      bun add -g @profullstack/threatcrush
      ;;
    npm|*)
      echo "${GREEN}→ Installing via npm...${RESET}"
      npm i -g @profullstack/threatcrush
      ;;
  esac

  echo ""

  if command -v threatcrush >/dev/null 2>&1; then
    VERSION=$(threatcrush --version 2>/dev/null || echo "unknown")
    echo "${GREEN}✓ ThreatCrush v${VERSION} installed successfully!${RESET}"
    echo ""
    echo "  Get started:"
    echo "    ${GREEN}threatcrush${RESET}          ${DIM}# Setup & join waitlist${RESET}"
    echo "    ${GREEN}threatcrush monitor${RESET}  ${DIM}# Real-time security monitoring${RESET}"
    echo "    ${GREEN}threatcrush tui${RESET}      ${DIM}# Interactive dashboard${RESET}"
    echo "    ${GREEN}threatcrush scan .${RESET}   ${DIM}# Scan code for vulnerabilities${RESET}"
  else
    echo "${RED}Installation completed but 'threatcrush' command not found in PATH.${RESET}"
    echo "Try: ${GREEN}npx @profullstack/threatcrush${RESET}"
  fi
}

# ─── Docker install ───

install_docker() {
  echo ""
  echo "${GREEN}→ Pulling ThreatCrush Docker image...${RESET}"
  docker pull profullstack/threatcrush:latest 2>/dev/null || {
    echo "${YELLOW}Image not on Docker Hub yet. Building locally...${RESET}"
    TMPDIR=$(mktemp -d)
    cat > "$TMPDIR/Dockerfile" << 'DOCKERFILE'
FROM node:22-alpine
RUN npm i -g @profullstack/threatcrush
ENTRYPOINT ["threatcrush"]
CMD ["monitor"]
DOCKERFILE
    docker build -t profullstack/threatcrush:latest "$TMPDIR"
    rm -rf "$TMPDIR"
  }

  echo ""
  echo "${GREEN}✓ ThreatCrush Docker image ready!${RESET}"
  echo ""
  echo "  Get started:"
  echo "    ${GREEN}docker run -it profullstack/threatcrush${RESET}              ${DIM}# Setup${RESET}"
  echo "    ${GREEN}docker run -it profullstack/threatcrush monitor${RESET}      ${DIM}# Monitor${RESET}"
  echo "    ${GREEN}docker run -it profullstack/threatcrush tui${RESET}          ${DIM}# Dashboard${RESET}"
  echo ""
  echo "  Run as daemon (monitor your server):"
  echo "    ${GREEN}docker run -d --net=host --name threatcrush \\${RESET}"
  echo "    ${GREEN}  -v /var/log:/var/log:ro \\${RESET}"
  echo "    ${GREEN}  profullstack/threatcrush monitor${RESET}"
  echo ""
  echo "  ${DIM}Alias for convenience:${RESET}"
  echo "    ${GREEN}alias threatcrush='docker run -it --rm profullstack/threatcrush'${RESET}"
}

# ─── Run ───

case "$INSTALL_METHOD" in
  docker) install_docker ;;
  *) install_native ;;
esac

echo ""
echo "  ${DIM}Docs:${RESET}   https://threatcrush.com"
echo "  ${DIM}GitHub:${RESET} https://github.com/profullstack/threatcrush"
echo "  ${DIM}npm:${RESET}    https://www.npmjs.com/package/@profullstack/threatcrush"
echo "  ${DIM}Docker:${RESET} profullstack/threatcrush"
echo ""
