# FlowFix AI: Smart City Traffic Command Center

This is a real-time smart city traffic control command center simulation. It models how vehicles travel through a 4-intersection city grid and compares how different signal control strategies (including an AI queue-optimizer) reduce delays, clear traffic jams, and cut carbon emissions.

---

## 🚦 How It Works (The Simulation Engine)

Unlike basic mock interfaces, the grid map runs a high-performance physics simulation rendered on an HTML5 Canvas at 60 frames per second.

*   **Road Coordinates:** The map contains 4 intersections (Node A to D) connected by double-lane roads (one lane in each direction).
*   **Car-Following Safety Deceleration:** Vehicles look ahead in their current lane. If a vehicle is in front of them, they decelerate proportionally to maintain a safe distance and stop behind them. This simulates realistic queue buildups instead of cars colliding or clipping.
*   **Vector Turning:** At intersection centers, vehicles have a random chance to make a turn, activate their blinker, and transfer onto the crossing road's coordinate system.
*   **Signal Detection:** Vehicles track the traffic lights. A Red or Yellow signal in their direction forces them to brake and stop at the zebra crossing.

---

## 🤖 Traffic Management & Signal Algorithms

You can toggle the city's traffic light control modes dynamically to see how they handle congestion:

1.  **Static Time Cycle (Baseline):** The default configuration. The lights cycle on a fixed, hardcoded timer (12 seconds Green EW / Red NS, transitioning through Yellow, then swapping to Red EW / Green NS).
2.  **Actuated Sensors:** Simulates induction loop road sensors. If the active green lane is empty but vehicles are waiting on the red cross-street, the controller terminates the green phase early to clear the queue.
3.  **FlowFix AI Optimizer (Pressure Balancing):** Runs a dynamic queue-minimization heuristic. The algorithm evaluates vehicle queue lengths across all approaches. If a bottleneck forms in one direction, the AI overrides standard timers, extends green cycles, or shifts green phases to the highest-stress directions. This balances grid pressure and reduces wait times.

---

## ⚠️ Special Interventions

*   **Emergency Vehicle Preemption (EVP):** Toggling *Emergency Priority* spawns an ambulance with blue/red flashers. The system detects the ambulance, forces all downstream signals on its path to Green, and locks intersecting lanes on Red. Normal signal loops resume after the ambulance leaves.
*   **Pedestrian Crossings:** Clicking the *Pedestrian Call* button at a node overrides the signals to all-Red for 6 seconds, halting all traffic to allow safe pedestrian crossing.
*   **CO2 Telemetry:** Moving vehicles burn `0.1g/s` of CO2, while idling/stopped vehicles burn `0.4g/s`. The dashboard tallies net emissions and reports the total CO2 saved by the AI mode compared to the static timer baseline.
*   **Camera Infractions:** Speed cameras and red-light sensors monitor the intersections, scanning license plates and logging traffic violations directly in the live system feed.

---

## 💻 Running Locally

### Prerequisites
*   Node.js (v18+)

### Commands

1.  **Clone the project:**
    ```bash
    git clone https://github.com/Shubham-singh1602/flowfix-ai-dash.git
    cd flowfix-ai-dash
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start development server:**
    ```bash
    npm run dev
    ```

4.  **Open browser:**
    Navigate to `http://localhost:8080` to access the command room interface.
