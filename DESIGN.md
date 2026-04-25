# AI Outreach Agent Technical Design

## Overview
A semi-automated AI marketing assistant to find businesses, generate personalized outreach, and track conversions.

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: Supabase
- **Email**: Resend API
- **AI**: OpenAI API
- **Deployment**: Render

## Supabase Schema

### `leads` table
| Column | Type | Description |
| --- | --- | --- |
| id | uuid | Primary key |
| name | text | Business name |
| website | text | URL |
| contact_page | text | URL |
| email | text | Public email |
| phone | text | Public phone |
| industry | text | e.g., 'restaurant', 'gym' |
| score | int | Qualification score (0-100) |
| status | text | 'not_contacted', 'sent', 'replied', 'interested', 'converted' |
| notes | text | Manual notes |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `outreach_logs` table
| Column | Type | Description |
| --- | --- | --- |
| id | uuid | Primary key |
| lead_id | uuid | Foreign key to leads.id |
| type | text | 'email' or 'whatsapp' |
| subject | text | Message subject |
| body | text | Message body |
| status | text | 'sent', 'failed' |
| sent_at | timestamptz | |

## API Endpoints (Express)

### Leads
- `GET /api/leads` - Get all leads (with filters)
- `POST /api/leads` - Create lead
- `PATCH /api/leads/:id` - Update lead

### Outreach
- `POST /api/outreach/generate` - Generate AI message (OpenAI)
- `POST /api/outreach/send` - Send email (Resend)

### Analytics
- `GET /api/analytics` - Get summary stats

## Frontend Components (React)
- `Dashboard`: Overview of stats
- `LeadManagement`: List and filter leads
- `LeadDetail`: View specific lead and generate/send messages
- `LeadDiscovery`: Form to trigger discovery process

## Directory Structure
```
/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types/utils (if needed)
└── docker-compose.yml
```
