import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ExtractedScent {
  id: string;
  scent_name: string;
  brand?: string;
  notes?: string[];
  description?: string;
  confidence: number;
}

interface Memory {
  id: string;
  title: string;
  occasion?: string;
  emotion?: string;
  season?: string;
  location?: string;
  memory_type: string;
  processed: boolean;
  created_at: string;
  extracted_scents?: ExtractedScent[];
}

interface MemoryVisualizationProps {
  memories?: Memory[];
}

// Example usage component
function MemoryNetworkPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemories() {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/memories?include_scents=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch memories');
        }
        
        const data = await response.json();
        setMemories(data.memories || data); // Adjust based on your API response structure
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMemories();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        <p className="mt-4 text-neutral-600">Loading your memory network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return <MemoryVisualization memories={memories} />;
}

// Fragrance family colors
const FRAGRANCE_FAMILIES: Record<string, { color: number; label: string }> = {
  floral: { color: 0xFFB5D8, label: 'Floral' },
  citrus: { color: 0xFFE066, label: 'Citrus' },
  woody: { color: 0x8B6F47, label: 'Woody' },
  oriental: { color: 0xB8860B, label: 'Oriental' },
  fresh: { color: 0x7FDBFF, label: 'Fresh' },
  spicy: { color: 0xFF6B35, label: 'Spicy' },
  sweet: { color: 0xFFB8E6, label: 'Sweet' },
  herbal: { color: 0x95D5B2, label: 'Herbal' },
  fruity: { color: 0xFF6B9D, label: 'Fruity' },
  aquatic: { color: 0x4ECDC4, label: 'Aquatic' },
  default: { color: 0xCCCCCC, label: 'Unknown' }
};

// Emotion-based edge colors
const EMOTION_COLORS: Record<string, number> = {
  joy: 0xFFD700,
  love: 0xFF1493,
  nostalgia: 0x9370DB,
  peace: 0x87CEEB,
  excitement: 0xFF4500,
  comfort: 0xF4A460,
  default: 0xE0E0E0
};

export default function MemoryVisualization({ memories = [] }: MemoryVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredMemory, setHoveredMemory] = useState<{
    title: string;
    emotion?: string;
    notes: string[];
    scent?: string;
  } | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Classify fragrance family from notes
  const classifyFragranceFamily = (notes: string[]): string => {
    if (!notes || notes.length === 0) return 'default';
    
    const notesLower = notes.map(n => n.toLowerCase()).join(' ');
    
    if (/(rose|jasmine|lily|violet|lavender|iris|peony|gardenia)/i.test(notesLower)) return 'floral';
    if (/(lemon|bergamot|orange|grapefruit|lime|mandarin)/i.test(notesLower)) return 'citrus';
    if (/(cedar|sandalwood|vetiver|oak|pine|bamboo)/i.test(notesLower)) return 'woody';
    if (/(amber|vanilla|musk|incense|oud|patchouli)/i.test(notesLower)) return 'oriental';
    if (/(mint|eucalyptus|green|grass|tea)/i.test(notesLower)) return 'fresh';
    if (/(cinnamon|pepper|ginger|cardamom|clove)/i.test(notesLower)) return 'spicy';
    if (/(caramel|honey|chocolate|tonka|praline)/i.test(notesLower)) return 'sweet';
    if (/(basil|sage|thyme|rosemary|chamomile)/i.test(notesLower)) return 'herbal';
    if (/(berry|apple|peach|pear|plum|cherry)/i.test(notesLower)) return 'fruity';
    if (/(ocean|marine|sea|water|rain)/i.test(notesLower)) return 'aquatic';
    
    return 'default';
  };

  useEffect(() => {
    if (!containerRef.current || memories.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFAFAFA);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const nodes: any[] = [];
    const processedMemories = memories.slice(0, 30);

    // Create memory nodes distributed on a sphere surface using Fibonacci sphere algorithm
    const sphereRadius = 10;
    const numPoints = processedMemories.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 radians

    processedMemories.forEach((memory, index) => {
      // Fibonacci sphere distribution for even spacing
      const y = 1 - (index / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = goldenAngle * index;

      const x = Math.cos(theta) * radius * sphereRadius;
      const z = Math.sin(theta) * radius * sphereRadius;
      const finalY = y * sphereRadius;

      // Get fragrance notes from extracted scents
      const allNotes: string[] = [];
      const scentName = memory.extracted_scents?.[0]?.scent_name || 'Unknown';
      
      if (memory.extracted_scents && memory.extracted_scents.length > 0) {
        memory.extracted_scents.forEach(scent => {
          if (scent.notes) {
            allNotes.push(...scent.notes);
          }
        });
      }

      const fragranceFamily = classifyFragranceFamily(allNotes);
      const familyData = FRAGRANCE_FAMILIES[fragranceFamily];

      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: familyData.color,
        shininess: 100,
        specular: 0x888888,
        emissive: familyData.color,
        emissiveIntensity: 0.2
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, finalY, z);
      sphere.userData = { 
        memory, 
        fragranceFamily,
        notes: allNotes,
        scentName
      };
      scene.add(sphere);
      nodes.push({ mesh: sphere, position: { x, y: finalY, z }, memory, notes: allNotes, fragranceFamily });
    });

    // Create connections based on shared notes or emotions - only connect nearby nodes for cleaner look
    const connections: THREE.Line[] = [];
    const maxDistance = sphereRadius * 0.8; // Only connect nodes within 80% of sphere diameter
    
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach(node2 => {
        // Calculate distance between nodes
        const dx = node1.position.x - node2.position.x;
        const dy = node1.position.y - node2.position.y;
        const dz = node1.position.z - node2.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Only create connection if nodes are close enough
        if (distance > maxDistance) return;
        
        let shouldConnect = false;
        let connectionColor = EMOTION_COLORS.default;
        let connectionOpacity = 0.12;
        
        // Connect by shared fragrance notes
        const sharedNotes = node1.notes.filter((note: string) => 
          node2.notes.some((n: string) => 
            n.toLowerCase().includes(note.toLowerCase()) || 
            note.toLowerCase().includes(n.toLowerCase())
          )
        );
        
        if (sharedNotes.length > 0) {
          shouldConnect = true;
          connectionOpacity = 0.15;
        }
        
        // Also connect by emotion (stronger connection)
        if (node1.memory.emotion && node2.memory.emotion && 
            node1.memory.emotion.toLowerCase() === node2.memory.emotion.toLowerCase()) {
          shouldConnect = true;
          connectionColor = EMOTION_COLORS[node1.memory.emotion.toLowerCase()] || EMOTION_COLORS.default;
          connectionOpacity = 0.25;
        }

        if (shouldConnect) {
          const points = [
            new THREE.Vector3(node1.position.x, node1.position.y, node1.position.z),
            new THREE.Vector3(node2.position.x, node2.position.y, node2.position.z)
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: connectionColor,
            opacity: connectionOpacity,
            transparent: true,
            linewidth: 1
          });
          const line = new THREE.Line(geometry, material);
          scene.add(line);
          connections.push(line);
        }
      });
    });

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x += deltaY * 0.005;
        scene.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, scene.rotation.x));
        previousMousePosition = { x: event.clientX, y: event.clientY };
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodes.map(n => n.mesh));

        nodes.forEach(node => {
          node.mesh.scale.set(1, 1, 1);
        });

        if (intersects.length > 0) {
          const hoveredObject = intersects[0].object;
          hoveredObject.scale.set(1.5, 1.5, 1.5);
          setHoveredMemory({
            title: hoveredObject.userData.memory.title,
            emotion: hoveredObject.userData.memory.emotion,
            notes: hoveredObject.userData.notes,
            scent: hoveredObject.userData.scentName
          });
          renderer.domElement.style.cursor = 'pointer';
        } else {
          setHoveredMemory(null);
          renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.style.cursor = 'grab';

    let animationTime = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      animationTime += 0.005;

      // Subtle pulsing animation - memories breathe slightly
      nodes.forEach((node, index) => {
        const pulse = Math.sin(animationTime * 2 + index * 0.2) * 0.05;
        node.mesh.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      });

      // Auto-rotate slowly
      if (!isDragging) {
        scene.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [memories]);

  if (memories.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 p-8">
        <p className="text-neutral-600">No memories to visualize yet. Upload your first memory to see the network.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-2xl font-light mb-1 text-neutral-800" style={{ fontFamily: 'serif' }}>
              Fragrance Memory Network
            </h3>
            <p className="text-sm text-neutral-600">
              {memories.length} memories connected by fragrance notes and emotions
            </p>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-50"
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
        </div>
        
        {hoveredMemory && (
          <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
            <p className="font-medium text-neutral-800">{hoveredMemory.title}</p>
            {hoveredMemory.scent && (
              <p className="text-xs text-neutral-600 mt-1">Scent: {hoveredMemory.scent}</p>
            )}
            {hoveredMemory.emotion && (
              <p className="text-xs text-neutral-600">Emotion: {hoveredMemory.emotion}</p>
            )}
            {hoveredMemory.notes.length > 0 && (
              <p className="text-xs text-neutral-600 mt-1">
                Notes: {hoveredMemory.notes.slice(0, 5).join(', ')}
                {hoveredMemory.notes.length > 5 ? '...' : ''}
              </p>
            )}
          </div>
        )}

        {showLegend && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-neutral-700 mb-2">Fragrance Families (Nodes)</p>
              <div className="space-y-1">
                {Object.entries(FRAGRANCE_FAMILIES).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-neutral-300"
                      style={{ backgroundColor: `#${value.color.toString(16).padStart(6, '0')}` }}
                    />
                    <span className="text-neutral-600">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-neutral-700 mb-2">Connections (Edges)</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-neutral-300" />
                  <span className="text-neutral-600">Shared fragrance notes</span>
                </div>
                {Object.entries(EMOTION_COLORS).slice(0, 6).map(([emotion, color]) => (
                  <div key={emotion} className="flex items-center gap-2">
                    <div 
                      className="w-8 h-0.5"
                      style={{ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }}
                    />
                    <span className="text-neutral-600 capitalize">{emotion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <div ref={containerRef} style={{ width: '100%', height: '600px', background: '#fafafa' }} />
        <div className="absolute bottom-4 left-4 text-xs text-neutral-500 bg-white/80 px-2 py-1 rounded">
          Drag to rotate • Hover to explore
        </div>
      </div>
    </div>
  );
}

export { MemoryNetworkPage };