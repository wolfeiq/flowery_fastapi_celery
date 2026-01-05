'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Memory {
  id: string;
  title: string;
  occasion: string;
  memory_type: string;
  processed: boolean;
  created_at: string;
}

interface MemoryVisualizationProps {
  memories: Memory[];
}

export default function MemoryVisualization({ memories }: MemoryVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredMemory, setHoveredMemory] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || memories.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

 
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const nodes: any[] = [];
    const processedMemories = memories.slice(0, 20);

    processedMemories.forEach((memory, index) => {
    
      const layer = Math.floor(index / 8);
      const indexInLayer = index % 8;
      const angle = (indexInLayer / 8) * Math.PI * 2;
      const radius = 5 + layer * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (layer - 1) * 2;


      const colorMap: Record<string, number> = {
        wedding: 0xe8b4b8,
        date: 0xd4a5a5,
        vacation: 0xa8c5c1,
        celebration: 0xf5d5a8,
        party: 0xc5a8d4,
        default: 0xb8c5d4
      };
      const color = colorMap[memory.occasion?.toLowerCase()] || colorMap.default;

      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color,
        shininess: 60,
        specular: 0x444444
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.userData = { memory, originalScale: 1 };
      scene.add(sphere);
      nodes.push({ mesh: sphere, position: { x, y, z }, memory });
    });


    const connections: THREE.Line[] = [];
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach(node2 => {
        if (node1.memory.occasion && 
            node1.memory.occasion === node2.memory.occasion) {
          const points = [
            new THREE.Vector3(node1.position.x, node1.position.y, node1.position.z),
            new THREE.Vector3(node2.position.x, node2.position.y, node2.position.z)
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0xe0e0e0,
            opacity: 0.2,
            transparent: true
          });
          const line = new THREE.Line(geometry, material);
          scene.add(line);
          connections.push(line);
        }
      });
    });


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
        scene.rotation.y += deltaX * 0.005;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodes.map(n => n.mesh));

        nodes.forEach(node => {
          node.mesh.scale.set(1, 1, 1);
        });

        if (intersects.length > 0) {
          const hoveredObject = intersects[0].object;
          hoveredObject.scale.set(1.4, 1.4, 1.4);
          setHoveredMemory(hoveredObject.userData.memory.title);
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
      animationTime += 0.01;

  
      nodes.forEach((node, index) => {
        node.mesh.position.y = node.position.y + Math.sin(animationTime + index * 0.5) * 0.1;
      });


      if (!isDragging) {
        scene.rotation.y += 0.002;
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
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [memories]);

  if (memories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-neutral-200 overflow-hidden">
      <div className="p-8 border-b border-neutral-200">
        <h3 className="text-2xl font-light mb-2 text-neutral-800" style={{ fontFamily: 'serif' }}>
          Memory Network
        </h3>
        <p className="text-sm font-light text-neutral-600">
          Your memories in 3D space. Drag to rotate, hover to explore. Lines connect shared occasions.
        </p>
        {hoveredMemory && (
          <p className="text-sm font-light text-neutral-800 mt-2">
            → {hoveredMemory}
          </p>
        )}
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '600px', background: '#fafafa' }} />
    </div>
  );
}