# @profullstack/threatcrush

> All-in-one security agent — monitor, detect, scan, and protect servers in real-time.

ThreatCrush is a security daemon that runs on your server, monitoring every connection on every port. It detects live attacks, scans your codebase, pentests your APIs, and alerts you in real-time.

## Install

```bash
npm i -g @profullstack/threatcrush
```

## Usage

```bash
threatcrush              # Get started
threatcrush monitor      # Real-time security monitoring
threatcrush tui          # Interactive dashboard (htop for security)
threatcrush scan ./src   # Scan code for vulnerabilities
threatcrush pentest URL  # Penetration test a URL
threatcrush init         # Auto-detect services, generate config
threatcrush modules      # Manage security modules
threatcrush store        # Browse the module marketplace
```

## What It Does

- **Live Attack Detection** — Monitors all inbound connections on every port. Detects SQLi, XSS, brute force, SSH attacks, port scans, DNS tunneling.
- **Code Security Scanner** — Scan your codebase for vulnerabilities, secrets, and misconfigurations.
- **Pentest Engine** — Automated penetration testing on your URLs and APIs.
- **Network Monitor** — Watches all TCP/UDP traffic across every port.
- **Real-time Alerts** — Slack, email, webhook notifications when threats are detected.
- **systemd Daemon** — Runs as a background service, auto-starts on boot.

## Modular Architecture

ThreatCrush uses a pluggable module system. Install modules from the marketplace or build your own:

```bash
threatcrush modules install ssh-guard
threatcrush modules install docker-monitor
threatcrush store search "firewall"
```

## Pricing

- **Lifetime Access** — $499 one-time (or $249 with a referral)
- Pay once, access forever. All core modules included.

## Links

- **Website:** [threatcrush.com](https://threatcrush.com)
- **GitHub:** [github.com/profullstack/threatcrush](https://github.com/profullstack/threatcrush)

## License

Proprietary. See [LICENSE](https://github.com/profullstack/threatcrush/blob/master/LICENSE) for details.
