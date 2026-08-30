# CryPe Backend

Decentralized-to-Fiat Instant Settlement Infrastructure

## Overview

CryPe is a microservices-backed platform enabling sub-3-second crypto-to-UPI settlements. This backend implements the core settlement pipeline, KYC/AML compliance, and liquidity management required for instant crypto-to-fiat conversions.

## Architecture

Decoupled microservices architecture with:

- **Identity Service**: KYC/AML compliance and user management
- **Liquidity Routing Engine**: Real-time DEX/OTC price discovery
- **Transaction Orchestrator**: State machine for Wallet -> Conversion -> UPI settlement
- **Payout Bridge**: NPCI/Banking API integration for instant fiat credit

## Technical Stack

- **Language**: TypeScript / Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (transactional) + Redis (latency-sensitive)
- **Blockchain**: Web3.js/Ethers.js with dedicated nodes
- **Container/Deployment**: AWS/GCP region-local hosting

## API Endpoints

### Authentication & KYC

| Endpoint | Method | Description |
|---|---|---|
| `/v1/user/register` | `POST` | Initialize user profile with Web3 wallet address |
| `/v1/user/kyc/verify` | `POST` | Biometric data and document verification |
| `/v1/user/status/:userId` | `GET` | Retrieve compliance level and spending limits |

### Settlement Pipeline

| Endpoint | Method | Description |
|---|---|---|
| `/v1/settle/quote` | `POST` | Real-time conversion quote (USDT/USDC to INR) |
| `/v1/settle/execute` | `POST` | Trigger settlement after user signs transaction |
| `/v1/settle/status/:txId` | `GET` | Real-time status updates (polling/webhook) |

### Liquidity Management

| Endpoint | Method | Description |
|---|---|---|
| `/v1/liquidity/health` | `GET` | Monitor DEX pool and OTC desk health |

## Core Features

- **Sub-3-second target**: Parallel DEX swap + UPI payout execution
- **Idempotency**: Unique `idempotency-key` prevents double-spending
- **Non-custodial**: Backend never stores private keys
- **AML pre-validation**: Structure ready for Chainalysis/Elliptic integration
- **Quote tracking**: Quote IDs persisted and tied to settlement transactions

## Security & Compliance

- Helmet.js HTTP security headers
- CORS configuration
- Input validation with 10kb body limit
- ISO 27001 / SOC 2 ready architecture
-AML monitoring: Real-time wallet sanctions list checking

## Development Milestones

| Sprint | Focus |
|---|---|
| **Sprint 1** | Core KYC pipeline and User Management |
| **Sprint 2** | DEX Aggregator integration (1inch/Uniswap) and Price Quoting engine |
| **Sprint 3** | UPI Gateway integration and "Happy Path" end-to-end testing |
| **Sprint 4** | Stress testing for concurrent transactions and latency optimization |

## Prerequisites

- Node.js v20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## Local Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Start server (with fallback mode if DB/Redis unavailable)
node dist/index.js

# Server runs on http://localhost:3000
```

## Environment Variables

Create `.env` file:

```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=crpe
POSTGRES_USER=crpe
POSTGRES_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Blockchain nodes (optional)
INFURA_PROJECT_ID=
ALCHEMY_PROJECT_ID=
```

## License

MIT

## Security Standard

ISO 27001 / SOC 2 Compliance ready.