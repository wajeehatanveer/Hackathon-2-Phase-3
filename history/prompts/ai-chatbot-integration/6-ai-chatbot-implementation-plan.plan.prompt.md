---
id: 6
title: AI-Chatbot-Implementation-Plan
stage: plan
date: 2026-02-17
surface: agent
model: Qwen
feature: ai-chatbot-integration
branch: 001-ai-chatbot-integration
user: hp
command: /sp.plan AI Todo Chatbot Integration Phase III
labels: [plan, ai-chatbot, phase-iii, cohere, mcp-tools, architecture]
links:
  spec: specs/001-ai-chatbot-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-ai-chatbot-integration/plan.md
 - specs/001-ai-chatbot-integration/research.md
 - specs/001-ai-chatbot-integration/data-model.md
 - specs/001-ai-chatbot-integration/quickstart.md
 - specs/001-ai-chatbot-integration/contracts/chat-api.yaml
 - specs/001-ai-chatbot-integration/contracts/mcp-tools.yaml
tests:
 - null
---

## Prompt

```text
/sp.plan AI Todo Chatbot Integration for The Evolution of Todo - Phase III: Full-Stack Web Application

Create: A flawless, rigorously sequenced, flagship-grade implementation blueprint that transforms the approved v1_chatbot.spec.md into a breathtakingly intelligent, emotionally delightful, production-ready AI Todo Chatbot seamlessly integrated into the existing full-stack masterpiece. This plan must guide the specialized agents (Database Engineer, MCP Tools Engineer, Chatbot Backend Engineer, Frontend Chatbot Engineer) to deliver absolute perfection: magical natural language task management, secure Cohere-powered reasoning with tool calling, persistent conversations, and a visually stunning, premium chat UI that harmonizes perfectly with the existing flagship design — resulting in a hackathon-dominating, real-world AI productivity experience.

Decisions needing documentation:

• Cohere Model Selection: command-r-plus vs. command-r (choose command-r-plus for superior reasoning)
• Tool Call Parsing: Strict JSON block extraction vs regex fallback (choose strict: require Cohere to output valid JSON in ```json ... ``` disable-run)
• Multi-Step Chaining: Single Cohere call vs. loop until no tool call (choose loop: execute tools, feed results back to Cohere until final response for complex queries like "List pending then delete the first")
• Conversation Persistence: Always new conversation_id if missing vs. single per user (choose optional: create new if not provided)
• Frontend Chat Panel Layout: Slide-in side panel vs. full bottom sheet (choose elegant slide-in from bottom-right with glassmorphic card for premium immersion)
• Message Rendering: Plain text vs. markdown support (choose markdown: assistant responses with bold, italic, lists, code blocks for rich, professional feel)
• Typing Indicator: Simple "AI is typing..." vs. animated dots (choose subtle animated dots with fade for delight)

Testing strategy:

• Intelligence Validation: Diverse natural language queries (simple add, ambiguous delete by title, chained list+complete, "Who am I?" → email response)
• Integration End-to-End: Frontend button → open panel → send message → backend Cohere call → tool execution → DB update → response bubbles appear → task list updates reflect changes
• Security & Isolation: Invalid JWT → 401, cross-user conversation → denied, tool calls with wrong user_id → rejected
• Persistence & Statelessness: Server restart → history loads, no session loss; multiple concurrent chats work
• Edge Cases: Malformed Cohere JSON → retry prompt, API error → friendly "I'm having trouble, try again", unknown intent → helpful clarification
• UI Perfection Audit: Chat panel animations cinematic, bubbles premium (glassmorphic assistant, solid user), theme switching flawless, mobile touch-optimized

Performance Check: Low latency (<2s typical response), efficient DB queries, no memory leaks

Technical details:

Execute in strict, phased sequence with mandatory agent-specific checkpoints — each phase atomic, testable, reversible.

Every action must explicitly reference v1_chatbot.spec.md sections (e.g., "Per Cohere API Adaptation Strategy", implement prompt with step-by-step reasoning").

• Async: Use async Cohere calls via cohere library, async DB sessions, stateless endpoint
• Cohere Prompt Engineering: System prompt for reasoning + tool schemas + "output JSON in ```json block" or direct response
• Tools: 6 total (add_task, delete_task, update_task, complete_task, list_tasks, get_current_user) — all stateless, enforce user_id from JWT

Phases:

Foundation:
• Extend SQLModel with Conversation and Message models, add indexes, async create_tables/migration (Database Engineer Agent)

MCP-Style Tools Implementation:
• Build 6 stateless tools with exact params/returns, integrate SQLModel CRUD, enforce user_id/email from JWT (MCP Tools Engineer Agent)

Cohere Integration Core:
• Implement Cohere client, system prompt with tool schemas, reasoning loop (call → parse JSON → execute tool → feed back until final) (Chatbot Backend Engineer Agent)

Stateless Chat Endpoint:
• Create POST /api/{user_id}/chat: JWT auth, load/save history, run Cohere loop, return response (Chatbot Backend Engineer Agent)

Conversation Management:
• Handle conversation_id creation/loading, message saving (user/assistant roles), efficient history fetching (Chatbot Backend Engineer Agent)

Frontend Chat Trigger:
• Add premium floating chatbot button (bottom-right, emerald accent, subtle pulse hover) (Frontend Chatbot Engineer Agent)

Chat Panel UI Mastery:
• Build stunning slide-in panel: header with close/title, glassmorphic bubbles, input bar with send SVG, typing indicator, theme-aware styling (Frontend Chatbot Engineer Agent)

Real-Time Chat Flow:
• Implement send message → loading state → streaming/fake typing → display assistant response, auto-scroll, error handling (Frontend Chatbot Engineer Agent)

Polish & Delight:
• Add micro-interactions (panel slide animation, bubble fade-in, send button ripple), markdown rendering, mobile optimization, accessibility (ARIA labels) (Frontend Chatbot Engineer Agent)

Final Validation & Magic:
• Comprehensive testing of all scenarios, end-to-end demo flows, intelligence audit, visual perfection review, prepare demo notes highlighting AI capabilities (All Agents)

Deliverables:
• Fully integrated, intelligent AI Todo Chatbot enhancing the flagship full-stack app
• Updated /backend with secure, stateless Cohere-powered endpoint and tools
• Stunning /frontend chat UI component seamlessly blended with premium design
• Updated README.md with Cohere setup, chatbot examples, "AI Magic Highlights" for judges
• IMPLEMENTATION_LOG.md documenting phase usage decisions
• Demo-ready: natural language task management that feels truly magical

Timeline for flagship completion within 24-36 hours via parallel agent execution — prioritize phases 1-5 for core intelligence, then 6-10 for breathtaking UI and perfection.

Guiding mantra: Do not merely add a chatbot — deliver an enchanting, intelligent companion that makes users fall in love with the app, whispering "This AI actually understands me perfectly." Flagship quality. Emotional delight. Absolute mastery.
```

## Response snapshot

Created comprehensive implementation plan with all Phase 0 and Phase 1 artifacts:

**Plan (plan.md)**:
- Technical context filled (Python 3.11, TypeScript 5.x, FastAPI, Next.js 16+, Cohere)
- 6 Constitution Check gates all PASS (Conversational Task Management, AI-First Interface, Stateless Architecture, Security & Isolation, Test-First, Database Extensions)
- Project structure defined for web application (backend + frontend)

**Research (research.md)**:
- Cohere Model: command-r-plus selected for superior reasoning and tool-calling
- Tool Call Parsing: Strict JSON block extraction with ```json markers
- Multi-Step Chaining: Loop until no tool call for complex queries
- Conversation Persistence: Optional conversation_id, create new if not provided
- Frontend Layout: Slide-in side panel from bottom-right with glassmorphic card
- Message Rendering: Markdown support for rich assistant responses
- Typing Indicator: Animated dots with fade effect

**Data Model (data-model.md)**:
- Conversation entity (id, user_id, title, created_at, updated_at) with indexes
- Message entity (id, conversation_id, role, content, created_at) with indexes
- Async CRUD operations defined
- Migration script included

**Quickstart (quickstart.md)**:
- Environment setup (COHERE_API_KEY, DATABASE_URL, BETTER_AUTH_SECRET)
- Installation steps for backend and frontend
- Local running instructions
- Natural language query test cases

**Contracts (contracts/)**:
- chat-api.yaml: OpenAPI 3.1 spec for POST /api/{user_id}/chat endpoint
- mcp-tools.yaml: Complete MCP tools specification for all 6 tools

## Outcome

- ✅ Impact: Created complete implementation blueprint with 6 design artifacts covering architecture, data models, API contracts, and quickstart guide
- 🧪 Tests: Constitution Check passed all 6 gates with justifications
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, contracts/chat-api.yaml, contracts/mcp-tools.yaml
- 🔁 Next prompts: Ready for /sp.tasks to break implementation into testable tasks
- 🧠 Reflection: Plan maintains strict adherence to constitution v3.0.0 with stateless architecture, Cohere-only AI, JWT security, and test-first requirements

## Evaluation notes (flywheel)

- Failure modes observed: None - all constitution gates passed, no unresolved clarifications
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin task creation with /sp.tasks focusing on Phase 1 Foundation (Database models) and Phase 2 MCP Tools implementation
