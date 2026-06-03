import React, { useEffect, useRef, useState } from 'react';

interface Intersection {
  id: string;
  name: string;
  x: number;
  y: number;
  vehicleCount: number;
  averageSpeed: number;
  signalState: 'green' | 'yellow' | 'red';
  congestionLevel: 'normal' | 'moderate' | 'heavy';
  lastUpdated: Date;
  spawnRates?: { north: number; south: number; east: number; west: number };
}

interface TrafficMapProps {
  intersections: Intersection[];
  selectedIntersection: string | null;
  onIntersectionClick: (id: string) => void;
  isSimulationRunning: boolean;
  simulation: {
    isRunning: boolean;
    scenario: string;
    vehicleDensity: number;
    speedFactor: number;
    emergencyPriority: boolean;
    autoMode: boolean;
    runtime: number;
    signalMode: 'baseline' | 'actuated' | 'ai_optimized';
  };
  onSimulationUpdate?: (metrics: {
    totalVehicles: number;
    averageSpeed: number;
    congestedCount: number;
    co2Saved: number;
    violations: Array<{ id: string; type: string; message: string; timestamp: Date }>;
    emergencyActive: boolean;
    queues: Record<string, number>;
  }) => void;
}

interface Vehicle {
  id: string;
  type: 'sedan' | 'truck' | 'ev' | 'ambulance';
  x: number;
  y: number;
  speed: number;
  targetSpeed: number;
  width: number;
  height: number;
  color: string;
  direction: 'E' | 'W' | 'N' | 'S';
  targetX: number;
  targetY: number;
  nextIntersectionId: string | null;
  route: string[];
  turning: 'straight' | 'left' | 'right';
  turnTimer: number;
  braking: boolean;
  idling: boolean;
  idleTime: number;
  emergencyFlasher: number;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({
  intersections,
  selectedIntersection,
  onIntersectionClick,
  isSimulationRunning,
  simulation,
  onSimulationUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vehiclesRef = useRef<Vehicle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const lastMetricReportRef = useRef<number>(0);
  const simulationRef = useRef(simulation);
  const intersectionsRef = useRef(intersections);
  const [hoveredIntersection, setHoveredIntersection] = useState<string | null>(null);
  const co2SavedAccumulator = useRef<number>(0);

  // FPS calculations
  const [fps, setFps] = useState<number>(60);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsIntervalRef = useRef<number>(0);

  useEffect(() => {
    simulationRef.current = simulation;
  }, [simulation]);

  useEffect(() => {
    intersectionsRef.current = intersections;
  }, [intersections]);

  const getIntersectionCoords = (id: string) => {
    switch (id) {
      case 'int-a': return { x: 220, y: 160 };
      case 'int-b': return { x: 580, y: 160 };
      case 'int-c': return { x: 220, y: 400 };
      case 'int-d': return { x: 580, y: 400 };
      default: return { x: 0, y: 0 };
    }
  };

  const getSignalDirectionState = (intersectionId: string, vehicleDir: 'E' | 'W' | 'N' | 'S') => {
    const intersection = intersectionsRef.current.find(i => i.id === intersectionId);
    if (!intersection) return 'red';

    const state = intersection.signalState;

    if (vehicleDir === 'E' || vehicleDir === 'W') {
      return state;
    } else {
      if (state === 'green') return 'red';
      if (state === 'red') return 'green';
      return 'yellow';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const roadWidth = 36;
    const canvasWidth = 800;
    const canvasHeight = 520;

    const handleResize = () => {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    };
    handleResize();

    const spawnVehicle = () => {
      const density = simulationRef.current.vehicleDensity;
      const scenario = simulationRef.current.scenario;
      
      let spawnChance = (density / 100) * 0.08;
      if (scenario === 'morning') spawnChance *= 1.4;
      if (scenario === 'evening') spawnChance *= 1.6;
      if (scenario === 'accident') spawnChance *= 0.5;

      if (Math.random() > spawnChance) return;

      const spawns: Array<{ x: number; y: number; dir: 'E' | 'W' | 'N' | 'S'; route: string[] }> = [
        { x: -20, y: 160 + 9, dir: 'E', route: ['int-a', 'int-b'] },
        { x: -20, y: 400 + 9, dir: 'E', route: ['int-c', 'int-d'] },
        { x: canvasWidth + 20, y: 160 - 9, dir: 'W', route: ['int-b', 'int-a'] },
        { x: canvasWidth + 20, y: 400 - 9, dir: 'W', route: ['int-d', 'int-c'] },
        { x: 220 - 9, y: -20, dir: 'S', route: ['int-a', 'int-c'] },
        { x: 580 - 9, y: -20, dir: 'S', route: ['int-b', 'int-d'] },
        { x: 220 + 9, y: canvasHeight + 20, dir: 'N', route: ['int-c', 'int-a'] },
        { x: 580 + 9, y: canvasHeight + 20, dir: 'N', route: ['int-d', 'int-b'] },
      ];

      const spawnPoint = spawns[Math.floor(Math.random() * spawns.length)];
      
      const spaceFree = vehiclesRef.current.every(v => {
        const dx = Math.abs(v.x - spawnPoint.x);
        const dy = Math.abs(v.y - spawnPoint.y);
        return dx > 45 || dy > 45;
      });

      if (!spaceFree) return;

      const rand = Math.random();
      let type: 'sedan' | 'truck' | 'ev' = 'sedan';
      let color = '#c8d8e8'; // --text-primary (Cold White Blue)
      
      if (rand < 0.20) {
        type = 'ev';
        color = '#00ff88'; // --accent-emerald
      } else if (rand < 0.35) {
        type = 'truck';
        color = '#ffaa00'; // --accent-amber
      }

      const baseSpeed = 2.0 + Math.random() * 0.8;

      const newVehicle: Vehicle = {
        id: `v-${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: spawnPoint.x,
        y: spawnPoint.y,
        speed: baseSpeed,
        targetSpeed: baseSpeed,
        width: type === 'truck' ? 16 : 12,
        height: type === 'truck' ? 8 : 6,
        color,
        direction: spawnPoint.dir,
        targetX: spawnPoint.x,
        targetY: spawnPoint.y,
        nextIntersectionId: spawnPoint.route[0] || null,
        route: spawnPoint.route,
        turning: 'straight',
        turnTimer: 0,
        braking: false,
        idling: false,
        idleTime: 0,
        emergencyFlasher: 0,
      };

      vehiclesRef.current.push(newVehicle);
    };

    const triggerEmergencyVehicle = () => {
      const exists = vehiclesRef.current.some(v => v.type === 'ambulance');
      if (exists) return;

      const newAmbulance: Vehicle = {
        id: 'ambulance-evp',
        type: 'ambulance',
        x: -25,
        y: 160 + 9,
        speed: 4.2,
        targetSpeed: 4.2,
        width: 16,
        height: 8,
        color: '#ff3355', // --accent-rose
        direction: 'E',
        targetX: -25,
        targetY: 160 + 9,
        nextIntersectionId: 'int-a',
        route: ['int-a', 'int-b'],
        turning: 'straight',
        turnTimer: 0,
        braking: false,
        idling: false,
        idleTime: 0,
        emergencyFlasher: 0,
      };

      vehiclesRef.current.push(newAmbulance);
    };

    const updatePhysics = () => {
      if (!isSimulationRunning) return;

      const currentVehicles = vehiclesRef.current;
      const speedMultiplier = simulationRef.current.speedFactor / 70;

      if (simulationRef.current.emergencyPriority) {
        triggerEmergencyVehicle();
      } else {
        vehiclesRef.current = currentVehicles.filter(v => !(v.type === 'ambulance' && v.x < 0));
      }

      for (let i = 0; i < currentVehicles.length; i++) {
        const v = currentVehicles[i];
        let desiredSpeed = v.targetSpeed * speedMultiplier;
        if (v.type === 'ambulance') desiredSpeed = 3.8 * speedMultiplier;

        let stopForSignal = false;
        v.braking = false;
        v.idling = false;

        if (v.nextIntersectionId) {
          const coords = getIntersectionCoords(v.nextIntersectionId);
          const signal = getSignalDirectionState(v.nextIntersectionId, v.direction);

          let dist = 999;
          if (v.direction === 'E') dist = coords.x - 24 - v.x;
          else if (v.direction === 'W') dist = v.x - (coords.x + 24);
          else if (v.direction === 'S') dist = coords.y - 24 - v.y;
          else if (v.direction === 'N') dist = v.y - (coords.y + 24);

          if (dist > 0 && dist < 100) {
            const hasEmergencyOverride = simulationRef.current.emergencyPriority && 
                                         vehiclesRef.current.some(amb => amb.type === 'ambulance' && amb.nextIntersectionId === v.nextIntersectionId);

            if (v.type === 'ambulance' && simulationRef.current.emergencyPriority) {
              stopForSignal = false;
            } else if (hasEmergencyOverride && (v.direction === 'E' || v.direction === 'W')) {
              stopForSignal = false;
            } else if (signal === 'red' || signal === 'yellow') {
              stopForSignal = true;
              const decel = Math.max(0.1, (dist / 100));
              desiredSpeed = Math.min(desiredSpeed, desiredSpeed * decel);
              v.braking = true;

              if (dist < 8) {
                desiredSpeed = 0;
                v.idling = true;
                v.idleTime += 1 / 60;
              }
            }
          }
        }

        // Car following model
        for (let j = 0; j < currentVehicles.length; j++) {
          if (i === j) continue;
          const other = currentVehicles[j];
          let isAhead = false;
          let headDist = 999;

          if (v.direction === other.direction) {
            if (v.direction === 'E' && other.x > v.x && Math.abs(other.y - v.y) < 4) {
              isAhead = true;
              headDist = other.x - other.width/2 - (v.x + v.width/2);
            } else if (v.direction === 'W' && other.x < v.x && Math.abs(other.y - v.y) < 4) {
              isAhead = true;
              headDist = (v.x - v.width/2) - (other.x + other.width/2);
            } else if (v.direction === 'S' && other.y > v.y && Math.abs(other.x - v.x) < 4) {
              isAhead = true;
              headDist = other.y - other.width/2 - (v.y + v.width/2);
            } else if (v.direction === 'N' && other.y < v.y && Math.abs(other.x - v.x) < 4) {
              isAhead = true;
              headDist = (v.y - v.width/2) - (other.y + other.width/2);
            }
          }

          if (isAhead && headDist > 0 && headDist < 50) {
            v.braking = true;
            if (headDist < 16) {
              desiredSpeed = 0;
              v.idling = true;
              v.idleTime += 1 / 60;
            } else {
              desiredSpeed = Math.min(desiredSpeed, other.speed * (headDist / 50));
            }
          }
        }

        if (v.speed < desiredSpeed) {
          v.speed += 0.08;
        } else if (v.speed > desiredSpeed) {
          v.speed -= 0.16;
        }
        v.speed = Math.max(0, Math.min(v.speed, desiredSpeed));

        if (v.direction === 'E') v.x += v.speed;
        else if (v.direction === 'W') v.x -= v.speed;
        else if (v.direction === 'S') v.y += v.speed;
        else if (v.direction === 'N') v.y -= v.speed;

        if (v.nextIntersectionId) {
          const coords = getIntersectionCoords(v.nextIntersectionId);
          let reachedCenter = false;

          if (v.direction === 'E' && v.x >= coords.x) reachedCenter = true;
          else if (v.direction === 'W' && v.x <= coords.x) reachedCenter = true;
          else if (v.direction === 'S' && v.y >= coords.y) reachedCenter = true;
          else if (v.direction === 'N' && v.y <= coords.y) reachedCenter = true;

          if (reachedCenter) {
            let nextDir = v.direction;
            let nextTurn: 'straight' | 'left' | 'right' = 'straight';

            if (v.type !== 'ambulance' && Math.random() < 0.22) {
              if (v.direction === 'E' || v.direction === 'W') {
                nextDir = Math.random() > 0.5 ? 'N' : 'S';
                nextTurn = nextDir === 'N' ? (v.direction === 'E' ? 'left' : 'right') : (v.direction === 'E' ? 'right' : 'left');
              } else {
                nextDir = Math.random() > 0.5 ? 'E' : 'W';
                nextTurn = nextDir === 'E' ? (v.direction === 'S' ? 'left' : 'right') : (v.direction === 'S' ? 'right' : 'left');
              }
            }

            if (nextTurn !== 'straight') {
              v.direction = nextDir;
              v.turning = nextTurn;
              v.turnTimer = 12;
              
              if (nextDir === 'E') { v.y = coords.y + 9; v.x = coords.x + 4; }
              else if (nextDir === 'W') { v.y = coords.y - 9; v.x = coords.x - 4; }
              else if (nextDir === 'S') { v.x = coords.x - 9; v.y = coords.y + 4; }
              else if (nextDir === 'N') { v.x = coords.x + 9; v.y = coords.y - 4; }
            }

            const currIdx = v.route.indexOf(v.nextIntersectionId);
            if (currIdx !== -1 && currIdx < v.route.length - 1) {
              v.nextIntersectionId = v.route[currIdx + 1];
            } else {
              v.nextIntersectionId = null;
            }
          }
        }

        if (v.type === 'ambulance') {
          v.emergencyFlasher = (v.emergencyFlasher + 1) % 16;
        }
        if (v.turnTimer > 0) v.turnTimer--;
      }

      vehiclesRef.current = currentVehicles.filter(v => {
        return (
          v.x >= -40 &&
          v.x <= canvasWidth + 40 &&
          v.y >= -40 &&
          v.y <= canvasHeight + 40
        );
      });
    };

    const drawMap = () => {
      // Background Void Color
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Engineering Dot Grid Background (40px spacing, 4% opacity)
      ctx.fillStyle = 'rgba(200, 216, 232, 0.04)';
      for (let x = 20; x < canvasWidth; x += 40) {
        for (let y = 20; y < canvasHeight; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Roads (Strict 2px borders)
      ctx.strokeStyle = '#1c2333'; // --border-primary
      ctx.lineWidth = 2;
      ctx.fillStyle = '#0a0c12'; // --bg-panel

      // Horizontal Roads
      ctx.fillRect(0, 160 - roadWidth/2, canvasWidth, roadWidth);
      ctx.strokeRect(-5, 160 - roadWidth/2, canvasWidth + 10, roadWidth);
      ctx.fillRect(0, 400 - roadWidth/2, canvasWidth, roadWidth);
      ctx.strokeRect(-5, 400 - roadWidth/2, canvasWidth + 10, roadWidth);
      
      // Vertical Roads
      ctx.fillRect(220 - roadWidth/2, 0, roadWidth, canvasHeight);
      ctx.strokeRect(220 - roadWidth/2, -5, roadWidth, canvasHeight + 10);
      ctx.fillRect(580 - roadWidth/2, 0, roadWidth, canvasHeight);
      ctx.strokeRect(580 - roadWidth/2, -5, roadWidth, canvasHeight + 10);

      // Dashed lane separators (20% opacity)
      ctx.strokeStyle = 'rgba(74, 90, 106, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      
      ctx.beginPath();
      // Horizontals
      ctx.moveTo(0, 160); ctx.lineTo(canvasWidth, 160);
      ctx.moveTo(0, 400); ctx.lineTo(canvasWidth, 400);
      // Verticals
      ctx.moveTo(220, 0); ctx.lineTo(220, canvasHeight);
      ctx.moveTo(580, 0); ctx.lineTo(580, canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Zebra Crossings
      const intersectionsList = ['int-a', 'int-b', 'int-c', 'int-d'];
      intersectionsList.forEach(id => {
        const coords = getIntersectionCoords(id);
        
        ctx.fillStyle = 'rgba(200, 216, 232, 0.08)';
        const bars = 4;
        const barW = 3;
        const barL = 16;
        const spacing = 5;
        
        const drawCrosswalk = (cx: number, cy: number, horiz: boolean) => {
          if (horiz) {
            for (let k = 0; k < bars; k++) {
              ctx.fillRect(cx - barL/2, cy - roadWidth/2 + k * (barW + spacing) + 3, barL, barW);
            }
          } else {
            for (let k = 0; k < bars; k++) {
              ctx.fillRect(cx - roadWidth/2 + k * (barW + spacing) + 3, cy - barL/2, barW, barL);
            }
          }
        };

        drawCrosswalk(coords.x - 38, coords.y, true);
        drawCrosswalk(coords.x + 38, coords.y, true);
        drawCrosswalk(coords.x, coords.y - 38, false);
        drawCrosswalk(coords.x, coords.y + 38, false);
      });

      // Draw Intersections as DIAMOND shapes (◇)
      intersectionsRef.current.forEach(intersection => {
        const coords = getIntersectionCoords(intersection.id);
        const isSelected = selectedIntersection === intersection.id;
        const isHovered = hoveredIntersection === intersection.id;

        // Draw diamond container
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y - 25);
        ctx.lineTo(coords.x + 25, coords.y);
        ctx.lineTo(coords.x, coords.y + 25);
        ctx.lineTo(coords.x - 25, coords.y);
        ctx.closePath();
        ctx.fillStyle = '#0a0c12';
        ctx.strokeStyle = '#1c2333';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Selected: Hard rectangular glow box
        if (isSelected || isHovered) {
          const strokeCol = isSelected ? '#00d4ff' : 'rgba(0, 212, 255, 0.4)';
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(coords.x - 28, coords.y - 28, 56, 56);
          
          if (isSelected) {
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 6;
            ctx.strokeRect(coords.x - 28, coords.y - 28, 56, 56);
            ctx.shadowBlur = 0; // reset
          }
        }

        // Stacked Traffic Lights (Vertical stacks)
        const drawTrafficLightStack = (lx: number, ly: number, activeState: string) => {
          const states = ['red', 'yellow', 'green'] as const;
          const colors = { red: '#ff3355', yellow: '#ffaa00', green: '#00ff88' };
          
          // Case container block
          ctx.fillStyle = '#050508';
          ctx.fillRect(lx - 4, ly - 10, 8, 20);
          ctx.strokeStyle = '#1c2333';
          ctx.lineWidth = 1;
          ctx.strokeRect(lx - 4, ly - 10, 8, 20);
          
          states.forEach((s, idx) => {
            const cy = ly - 6 + idx * 6;
            const isActive = activeState === s;
            
            ctx.fillStyle = colors[s];
            ctx.globalAlpha = isActive ? 1.0 : 0.08;
            
            ctx.beginPath();
            ctx.arc(lx, cy, 2, 0, Math.PI * 2);
            ctx.fill();
            
            if (isActive) {
              ctx.shadowColor = colors[s];
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(lx, cy, 1, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          });
          ctx.globalAlpha = 1.0;
        };

        const ewSignal = getSignalDirectionState(intersection.id, 'E');
        const nsSignal = getSignalDirectionState(intersection.id, 'S');

        // Draw stacked signal blocks facing incoming lanes
        drawTrafficLightStack(coords.x - 28, coords.y - 12, ewSignal); // Eastbound
        drawTrafficLightStack(coords.x + 28, coords.y + 12, ewSignal); // Westbound
        drawTrafficLightStack(coords.x + 28, coords.y - 12, nsSignal); // Southbound
        drawTrafficLightStack(coords.x - 28, coords.y + 12, nsSignal); // Northbound

        // Intersection tag
        ctx.fillStyle = isSelected ? '#00d4ff' : '#4a5a6a';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(intersection.name.split(' & ')[0].toUpperCase(), coords.x, coords.y - 36);
      });

      // Draw pointed rectangular vehicles
      vehiclesRef.current.forEach(v => {
        ctx.save();
        ctx.translate(v.x, v.y);

        if (v.direction === 'S') ctx.rotate(Math.PI / 2);
        else if (v.direction === 'N') ctx.rotate(-Math.PI / 2);
        else if (v.direction === 'W') ctx.rotate(Math.PI);

        // Ambulance glow pulse
        if (v.type === 'ambulance') {
          ctx.shadowColor = '#ff3355';
          ctx.shadowBlur = Math.abs(Math.sin(Date.now() / 80)) * 6 + 2;
        }

        ctx.fillStyle = v.color;
        ctx.beginPath();
        // Pointed nose indicating direction
        ctx.moveTo(-v.width/2, -v.height/2);
        ctx.lineTo(v.width/2 - 2, -v.height/2);
        ctx.lineTo(v.width/2, 0); // Pointed nose
        ctx.lineTo(v.width/2 - 2, v.height/2);
        ctx.lineTo(-v.width/2, v.height/2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Simple windshield line
        ctx.fillStyle = '#050508';
        ctx.fillRect(v.width/4 - 1.5, -v.height/2 + 1, 1.5, v.height - 2);

        // Headlights
        ctx.fillStyle = '#e2f0ff';
        ctx.fillRect(v.width/2 - 2, -v.height/2 + 0.5, 1, 1);
        ctx.fillRect(v.width/2 - 2, v.height/2 - 1.5, 1, 1);

        // Braking indicators
        if (v.braking) {
          ctx.fillStyle = '#ff3355';
          ctx.fillRect(-v.width/2, -v.height/2 + 0.5, 1, 1);
          ctx.fillRect(-v.width/2, v.height/2 - 1.5, 1, 1);
        }

        ctx.restore();
      });

      // Draw FPS counter (top-right, --text-dim)
      ctx.fillStyle = '#4a5a6a';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`SYS_FPS: ${fps}`, canvasWidth - 10, 20);
    };

    const tick = (timestamp: number) => {
      // Calculate FPS
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
        fpsIntervalRef.current = timestamp;
      }
      const delta = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      
      frameCountRef.current++;
      if (timestamp - fpsIntervalRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (timestamp - fpsIntervalRef.current)));
        frameCountRef.current = 0;
        fpsIntervalRef.current = timestamp;
      }

      if (timestamp - lastSpawnRef.current > 400) {
        spawnVehicle();
        lastSpawnRef.current = timestamp;
      }

      updatePhysics();
      drawMap();

      if (timestamp - lastMetricReportRef.current > 800) {
        lastMetricReportRef.current = timestamp;
        reportMetrics();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    const reportMetrics = () => {
      if (!onSimulationUpdate) return;

      const currentVehicles = vehiclesRef.current;
      const totalVehiclesCount = currentVehicles.length;

      const avgSpd = totalVehiclesCount > 0 
        ? Math.round(currentVehicles.reduce((sum, v) => sum + v.speed, 0) / totalVehiclesCount * 12) 
        : 35;

      const queues: Record<string, number> = {
        'int-a': 0, 'int-b': 0, 'int-c': 0, 'int-d': 0
      };

      let congestedIntersectionsCount = 0;

      currentVehicles.forEach(v => {
        if (v.nextIntersectionId && v.speed < 0.8) {
          queues[v.nextIntersectionId] += 1;
        }
      });

      Object.keys(queues).forEach(key => {
        if (queues[key] > 5) congestedIntersectionsCount++;
      });

      let co2Multiplier = 1.0;
      if (simulationRef.current.signalMode === 'ai_optimized') {
        co2Multiplier = 0.65;
      } else if (simulationRef.current.signalMode === 'actuated') {
        co2Multiplier = 0.85;
      }

      const totalIdlers = currentVehicles.filter(v => v.speed < 0.5).length;
      const incrementalSaved = (totalIdlers * 0.25 + (totalVehiclesCount - totalIdlers) * 0.05) * (1 - co2Multiplier) * 0.8 / 1000;
      co2SavedAccumulator.current += incrementalSaved;

      const violationsList: Array<{ id: string; type: string; message: string; timestamp: Date }> = [];
      
      if (isSimulationRunning && Math.random() < 0.035 && totalVehiclesCount > 0) {
        const culprit = currentVehicles[Math.floor(Math.random() * totalVehiclesCount)];
        
        if (culprit.type !== 'ambulance') {
          const intersection = intersectionsRef.current.find(i => i.id === culprit.nextIntersectionId);
          if (intersection) {
            const signal = getSignalDirectionState(intersection.id, culprit.direction);
            
            if (signal === 'red' && culprit.speed > 1.5) {
              violationsList.push({
                id: `violation-${Date.now()}`,
                type: 'RED LIGHT VIOLATION',
                message: `LIC-${Math.round(Math.random()*9000+1000)} // RUNNING RED LIGHT AT ${intersection.name.split(' & ')[0].toUpperCase()}`,
                timestamp: new Date()
              });
            } else if (culprit.speed > 2.8) {
              violationsList.push({
                id: `violation-${Date.now()}`,
                type: 'SPEEDING TELEMETRY',
                message: `LIC-${Math.round(Math.random()*9000+1000)} // ${Math.round(culprit.speed * 28)}KM/H IN 50 ZONE @ ${intersection.name.split(' & ')[0].toUpperCase()}`,
                timestamp: new Date()
              });
            }
          }
        }
      }

      onSimulationUpdate({
        totalVehicles: totalVehiclesCount,
        averageSpeed: avgSpd,
        congestedCount: congestedIntersectionsCount,
        co2Saved: Number(co2SavedAccumulator.current.toFixed(3)),
        violations: violationsList,
        emergencyActive: currentVehicles.some(v => v.type === 'ambulance' && v.x < 580),
        queues,
      });
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSimulationRunning]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 800;
    const clickY = ((e.clientY - rect.top) / rect.height) * 520;

    const intersectionIds = ['int-a', 'int-b', 'int-c', 'int-d'];
    let clickedIntersectionId: string | null = null;

    for (const id of intersectionIds) {
      const coords = getIntersectionCoords(id);
      const dist = Math.sqrt((clickX - coords.x) ** 2 + (clickY - coords.y) ** 2);
      if (dist <= 30) {
        clickedIntersectionId = id;
        break;
      }
    }

    if (clickedIntersectionId) {
      onIntersectionClick(clickedIntersectionId);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const hoverX = ((e.clientX - rect.left) / rect.width) * 800;
    const hoverY = ((e.clientY - rect.top) / rect.height) * 520;

    const intersectionIds = ['int-a', 'int-b', 'int-c', 'int-d'];
    let hoveredId: string | null = null;

    for (const id of intersectionIds) {
      const coords = getIntersectionCoords(id);
      const dist = Math.sqrt((hoverX - coords.x) ** 2 + (hoverY - coords.y) ** 2);
      if (dist <= 30) {
        hoveredId = id;
        break;
      }
    }

    if (hoveredId !== hoveredIntersection) {
      setHoveredIntersection(hoveredId);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050508] overflow-hidden flex flex-col justify-between">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="w-full h-full"
        style={{ display: 'block', maxHeight: '520px' }}
      />
    </div>
  );
};