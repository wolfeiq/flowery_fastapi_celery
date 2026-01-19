import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MemoryVisualizationProps {
  memories: any[];
}


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
};

const CONNECTION_TYPES: Record<string, { color: number; label: string; opacity: number }> = {
  emotion: { color: 0xFF1493, label: 'Shared Emotion', opacity: 0.4 },
  notes: { color: 0xFFD700, label: 'Shared Notes', opacity: 0.35 },
  family: { color: 0x9370DB, label: 'Shared Fragrance Family', opacity: 0.3 },
};

export default function MemoryVisualization({ memories = [] }: MemoryVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredMemory, setHoveredMemory] = useState<{
    title: string;
    emotion?: string;
    notes: string[];
    scent?: string;
    family?: string;
  } | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const getFragranceFamily = (scent?: any): string => {
    if (!scent) return 'default';
    
    if (scent.scent_family) {
      const family = scent.scent_family.toLowerCase();
      if (FRAGRANCE_FAMILIES[family]) return family;
    }
    
    const allNotes = [
      ...(scent.top_notes || []),
      ...(scent.heart_notes || []),
      ...(scent.base_notes || [])
    ];
    
    if (allNotes.length === 0) return 'default';
    
    const notesLower = allNotes.map((n: string) => n.toLowerCase()).join(' ');
    
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


  const getNodeColor = (scent?: any): number => {
    if (!scent?.color) return 0xc98e8f; 
    const cleaned = scent.color.replace('#', '');
    return parseInt(cleaned, 16);
  };

  const processedMemories = memories.filter(m => m.processed);

  useEffect(() => {
    if (!containerRef.current || processedMemories.length < 2) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const nodes: any[] = [];
    const limitedMemories = processedMemories.slice(0, 30);

    const sphereRadius = 10;
    const numPoints = limitedMemories.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    limitedMemories.forEach((memory, index) => {
      const y = 1 - (index / (numPoints - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * index;

      const x = Math.cos(theta) * radius * sphereRadius;
      const z = Math.sin(theta) * radius * sphereRadius;
      const finalY = y * sphereRadius;
      const primaryScent = memory.extracted_scents?.[0];
      const allNotes: string[] = [];
      const scentName = primaryScent?.scent_name || 'Unknown';
      
      if (primaryScent) {
        if (primaryScent.top_notes) allNotes.push(...primaryScent.top_notes);
        if (primaryScent.heart_notes) allNotes.push(...primaryScent.heart_notes);
        if (primaryScent.base_notes) allNotes.push(...primaryScent.base_notes);
      }

      const fragranceFamily = getFragranceFamily(primaryScent);
    
      const nodeColor = getNodeColor(primaryScent);

      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: nodeColor,
        shininess: 100,
        specular: 0x888888,
        emissive: nodeColor,
        emissiveIntensity: 0.3
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      
      const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      
      const nodeGroup = new THREE.Group();
      nodeGroup.add(sphere);
      nodeGroup.add(glowMesh);
      nodeGroup.position.set(x, finalY, z);
      
      sphere.userData = { 
        memory, 
        fragranceFamily,
        notes: allNotes,
        scentName,
        scentFamily: primaryScent?.scent_family,
        topNotes: primaryScent?.top_notes || [],
        heartNotes: primaryScent?.heart_notes || [],
        baseNotes: primaryScent?.base_notes || []
      };
      scene.add(nodeGroup);
      nodes.push({ 
        mesh: sphere,
        glowMesh: glowMesh,
        group: nodeGroup,
        position: { x, y: finalY, z }, 
        memory, 
        notes: allNotes, 
        fragranceFamily,
        emotion: memory.emotion || primaryScent?.emotion,
        topNotes: primaryScent?.top_notes || [],
        heartNotes: primaryScent?.heart_notes || [],
        baseNotes: primaryScent?.base_notes || []
      });
    });
    const connections: { line: THREE.Line; label: string; memory1: string; memory2: string }[] = [];
    
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach(node2 => {
        let connectionType = '';
        let sharedDetail = '';
        

        const allNotes1 = [...node1.topNotes, ...node1.heartNotes, ...node1.baseNotes];
        const allNotes2 = [...node2.topNotes, ...node2.heartNotes, ...node2.baseNotes];
        

        if (node1.emotion && node2.emotion && 
            node1.emotion.toLowerCase() === node2.emotion.toLowerCase()) {
          connectionType = 'emotion';
          sharedDetail = node1.emotion;
        }

        else if (allNotes1.length > 0 && allNotes2.length > 0) {
          const sharedNotes = allNotes1.filter((note1: string) =>
            allNotes2.some((note2: string) =>
              note1.toLowerCase().trim() === note2.toLowerCase().trim() ||
              note1.toLowerCase().includes(note2.toLowerCase()) ||
              note2.toLowerCase().includes(note1.toLowerCase())
            )
          );
          
          if (sharedNotes.length > 0) {
            connectionType = 'notes';
            sharedDetail = sharedNotes.slice(0, 2).join(', ');
          }
        }
        if (!connectionType && node1.fragranceFamily === node2.fragranceFamily && 
            node1.fragranceFamily !== 'default') {
          connectionType = 'family';
          sharedDetail = node1.fragranceFamily;
        }

        if (connectionType) {
          const connType = CONNECTION_TYPES[connectionType];
          const points = [
            new THREE.Vector3(node1.position.x, node1.position.y, node1.position.z),
            new THREE.Vector3(node2.position.x, node2.position.y, node2.position.z)
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: connType.color,
            opacity: connType.opacity,
            transparent: true,
            linewidth: 3
          });
          const line = new THREE.Line(geometry, material);
          line.userData = {
            memory1: node1.memory.title,
            memory2: node2.memory.title,
            shared: sharedDetail,
            type: connectionType
          };
          scene.add(line);
          
          connections.push({ 
            line, 
            label: `${node1.memory.title} ↔ ${node2.memory.title}\n${sharedDetail}`,
            memory1: node1.memory.title,
            memory2: node2.memory.title
          });
        }
      });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let hoveredConnection: { label: string; midpoint: THREE.Vector3 } | null = null;

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
          node.glowMesh.scale.set(1, 1, 1);
        });

        hoveredConnection = null;

        if (intersects.length > 0) {
          const hoveredObject = intersects[0].object;
          hoveredObject.scale.set(1.5, 1.5, 1.5);
          const glowNode = nodes.find(n => n.mesh === hoveredObject);
          if (glowNode) {
            glowNode.glowMesh.scale.set(1.5, 1.5, 1.5);
          }
          
          setHoveredMemory({
            title: hoveredObject.userData.memory.title,
            emotion: hoveredObject.userData.memory.emotion || hoveredObject.userData.memory.extracted_scents?.[0]?.emotion,
            notes: hoveredObject.userData.notes,
            scent: hoveredObject.userData.scentName,
            family: hoveredObject.userData.scentFamily
          });
          renderer.domElement.style.cursor = 'pointer';
        } else {
          raycaster.setFromCamera(mouse, camera);
          const lineIntersects = raycaster.intersectObjects(connections.map(c => c.line));
          
          if (lineIntersects.length > 0) {
            const hoveredLine = lineIntersects[0].object;
            const connData = connections.find(c => c.line === hoveredLine);
            if (connData) {
              setHoveredEdge(connData.label);
              renderer.domElement.style.cursor = 'pointer';
            }
          } else {
            setHoveredEdge(null);
            renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
          }
          
          setHoveredMemory(null);
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

      nodes.forEach((node, index) => {
        const pulse = Math.sin(animationTime * 2 + index * 0.2) * 0.05;
        const baseScale = node.mesh.scale.x > 1 ? 1.5 : 1;
        
        node.mesh.scale.set(baseScale + pulse, baseScale + pulse, baseScale + pulse);
        node.glowMesh.scale.set(baseScale + pulse, baseScale + pulse, baseScale + pulse);
      });

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
  }, [memories, processedMemories.length]);

  if (memories.length === 0) {
    return (
      <div className="bg-transparent backdrop-blur border border-[#c98e8f]/20 p-8 rounded-lg">
        <p className="text-[#c98e8f] font-light text-center">
          No memories yet. Upload your first memory to begin building your scent network.
        </p>
      </div>
    );
  }

  if (processedMemories.length < 2) {
    const unprocessedCount = memories.length - processedMemories.length;
    
    return (
      <div className="bg-transparent backdrop-blur border border-[#c98e8f]/20 p-8 rounded-lg">
        <div className="text-center space-y-3">
          <p className="text-[#c98e8f] font-light">
            Upload at least 2 memories to see connections in your scent network.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#c98e8f]/20 flex items-center justify-center">
                <span className="text-[#e89a9c] font-light">{processedMemories.length}</span>
              </div>
              <span className="text-[#c98e8f]/70 font-light">Processed</span>
            </div>
            {unprocessedCount > 0 && (
              <>
                <span className="text-[#c98e8f]/40">•</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#c98e8f]/10 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-[#c98e8f]/40 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-[#c98e8f]/70 font-light">Processing...</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent backdrop-blur border border-[#c98e8f]/20 rounded-lg overflow-hidden shadow-lg">
      <div className="p-6 border-b border-[#c98e8f]/10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-[#c98e8f]/70 font-light">
              {processedMemories.length} memories connected by fragrance notes and emotions
            </p>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs px-3 py-1 border border-[#c98e8f]/30 rounded hover:bg-[#c98e8f]/10 text-[#c98e8f] font-light transition"
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
        </div>

        {showLegend && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-light text-[#e89a9c] mb-2">Node Colors</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-[#c98e8f]/30"
                    style={{ backgroundColor: '#c98e8f' }}
                  />
                  <span className="text-[#c98e8f]/70 font-light">Custom scent color or gentle pink</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-light text-[#e89a9c] mb-2">Connection Types</p>
              <div className="space-y-1">
                {Object.entries(CONNECTION_TYPES).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-8 h-0.5"
                      style={{ backgroundColor: `#${value.color.toString(16).padStart(6, '0')}` }}
                    />
                    <span className="text-[#c98e8f]/70 font-light">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <div ref={containerRef} style={{ width: '100%', height: '600px' }} />

        {hoveredEdge && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-lg border border-[#c98e8f]/30 shadow-lg max-w-xs">
              <p className="text-xs text-[#e89a9c] font-light whitespace-pre-line text-center">
                {hoveredEdge}
              </p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 text-xs text-[#c98e8f]/60 bg-white/90 px-3 py-1.5 rounded border border-[#c98e8f]/20 font-light">
          Drag to rotate • Hover to explore
        </div>
      </div>
    </div>
  );
}