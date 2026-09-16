# EstateHub Backend

REST API for **EstateHub**, a real-estate CRM covering agents, leads, and property listings.

## Stack
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT authentication, bcrypt password hashing

## Setup

```bash
cd estatehub-backend
npm install
cp .env.example .env   # then fill in your Postgres credentials + JWT secret
npm run db:migrate      # creates/updates tables
npm run dev              # starts on http://localhost:5000
```

## API overview

### Auth (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create an agent/admin account |
| POST | `/login` | Log in, returns JWT |
| GET | `/me` | Get current user (auth required) |

### Agents (`/api/agents`) — auth required
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all agents |
| GET | `/:id` | Agent detail + their listings/leads |
| PATCH | `/:id` | Update agent (self or admin) |
| DELETE | `/:id` | Remove agent (admin only) |

### Listings (`/api/listings`)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List listings (public), filters: `status`, `propertyType`, `city`, `minPrice`, `maxPrice`, `agentId`, `search` |
| GET | `/:id` | Listing detail (public) |
| POST | `/` | Create listing (auth required) |
| PATCH | `/:id` | Update listing (auth required) |
| DELETE | `/:id` | Delete listing (auth required) |

### Leads (`/api/leads`) — auth required
| Method | Path | Description |
|---|---|---|
| GET | `/` | List leads, filters: `stage`, `source`, `interestType`, `agentId`, `search` |
| GET | `/pipeline` | Lead counts grouped by pipeline stage |
| GET | `/:id` | Lead detail |
| POST | `/` | Create lead |
| PATCH | `/:id` | Update lead (e.g. move `stage`) |
| DELETE | `/:id` | Delete lead |

## Data model
- **User** — agents and admins (`role`: `agent` \| `admin`)
- **Listing** — properties, each optionally assigned to an agent
- **Lead** — prospects moving through a pipeline (`new → contacted → qualified → negotiation → won/lost`), optionally linked to an agent and a listing
