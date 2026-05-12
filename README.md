# 🏎️ Neon Surge | Player Entity

### 🤖 Meet the Agent: Dash
**Dash, the Player Agent**, is the bold, agile spirit of Neon Surge. Always pushing the limits of the grid, Dash embodies speed and precision. Whether drifting through data-walls or boosting through the void, Dash is the ultimate avatar of high-octane performance, designed to outrun the laws of physics.

### ⚡ Superpowers
*   **High-Octane Controller**: Responsive movement logic tuned for high-speed arcade action and tactile precision.
*   **Dynamic State Machine**: Robust handling of Idle, Accelerating, and Drifting states with seamless transitions.
*   **Trail Emission**: Procedural light trails that map the player's path through the void, creating a visual legacy of speed.
*   **Speed Interpolation**: Silky-smooth velocity transitions that provide a professional, triple-A flight experience.

### 🌐 The 10-Agent Architecture
Neon Surge is powered by a collaborative network of 10 specialized agents, each mastering a unique domain of the Data Stream.

| Agent | Role | Repository |
| :--- | :--- | :--- |
| **The Heart** | Core Engine & Orchestration | `core-engine` |
| **The Senses** | Input Processing & Mapping | `input-system` |
| **The Voice** | Procedural Audio & Soundscapes | `audio-system` |
| **The Laws** | Physics & Collision Detection | `physics-system` |
| **The Face** | User Interface & Neon HUD | `ui-system` |
| **The Hero** | Player Entity & Controller | `player-entity` |
| **The Hazard** | Obstacle Intelligence | `obstacle-entity` |
| **The Mastermind** | Game Rules & State Logic | `game-logic` |
| **The Blueprint** | Lore & Documentation | `design-docs` |
| **The Architect** | Build & Deployment | `build-config` |

### 🛠️ How to Run
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone this agent into the `repos/` directory.
3. This agent is typically orchestrated by the [build-config](https://github.com/mayoka0/build-config) agent.
4. To run standalone tests:
   ```bash
   npm install
   npm run dev
   ```
