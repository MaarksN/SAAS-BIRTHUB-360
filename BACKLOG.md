# BACKLOG v1.2 - SALESOS ULTIMATE

## 🎨 UI/UX Overhaul: "SDR Commander v1.2"
**Status:** CONCEPT / ARCHIVED (Refined)
**Reference:** `apps/web/public/sdr-commander-v1.2.tsx` (React/Lucide/Tailwind)

### Context
This is an evolution of the v1.1 "BirthHub" concept, now refined into a React-based implementation named "SDR Commander". It features a significantly expanded toolset (40+ tools) and improved UI polish.

### Key Features Proposed
1. **Modules & Tools**:
   - 40+ specialized sales tools (Cadence, Cold Call Sim, Email Roast, DISC Decoder, etc.).
   - Granular tool configuration (inputs/prompts).
2. **AI Integration**:
   - **Gemini 2.5 Flash Preview**: Core text generation engine.
   - **Imagen 4.0**: Visual content generation.
   - **TTS (Puck Voice)**: Audio output for cold call simulation.
   - **Google Speech Recognition**: Voice input.
3. **UI/UX**:
   - "Glassmorphism" aesthetic with dark/light mode.
   - Animated transitions (Framer Motion style classes).
   - "Cockpit" dashboard view + Grid view + Tool execution view.
4. **Architecture**:
   - **Frontend**: React 18, Tailwind CSS, Lucide Icons.
   - **Backend**: Direct Firestore/Firebase Auth integration (Legacy pattern to be migrated).

### Migration Strategy (Post-DEFCON 3)
1.  **Component Library**: Extract generic UI components (Glass Card, Input, Button) to `libs/ui`.
2.  **Tool Registry**: Move the static `TOOLS` array to a config or database-backed service in `libs/core` or `libs/ai`.
3.  **API Gateway**: Refactor direct API calls (`fetchWithRetry`) to use the `libs/ai/llm-gateway` (which enforces CostGuard).
4.  **State**: Migrate `useState` based logic to a global store (Zustand/Context) to persist state between views.

---
*Updated by Agent Jules during v1.2 Archive Task.*
