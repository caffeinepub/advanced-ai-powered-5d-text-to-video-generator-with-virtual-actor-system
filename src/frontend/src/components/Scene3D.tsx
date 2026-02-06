import { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import VirtualActor from './VirtualActor';
import { GestureCue, EmotionTimeline } from '../backend';

interface Scene3DProps {
  text: string;
  isPlaying: boolean;
  isMuted: boolean;
  avatarUrl?: string;
  gestureCues?: GestureCue[];
  emotionTimeline?: EmotionTimeline[];
}

function AnalyzeText(text: string) {
  const lower = text.toLowerCase();
  
  return {
    hasForest: /forest|tree|wood|nature/i.test(text),
    hasCity: /city|urban|building|skyscraper/i.test(text),
    hasOcean: /ocean|sea|water|underwater|coral/i.test(text),
    hasMountain: /mountain|peak|snow|cabin/i.test(text),
    isNight: /night|dark|evening|dusk/i.test(text),
    isDawn: /dawn|sunrise|morning/i.test(text),
    isCalm: /calm|peaceful|serene|gentle/i.test(text),
    isEnergetic: /energetic|vibrant|dynamic|exciting/i.test(text),
    hasParticles: /particle|dust|mist|fog|glow/i.test(text),
    hasLight: /light|glow|shine|bright|ray/i.test(text),
  };
}

function AnimatedSphere({ position, color, scale = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 100, analysis }: any) {
  const points = useRef<THREE.Points>(null);

  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={points} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.1}
        color={analysis.hasOcean ? '#00ffff' : analysis.hasForest ? '#00ff00' : '#ffffff'}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Ground({ analysis }: any) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color={analysis.hasOcean ? '#1e40af' : analysis.hasForest ? '#166534' : '#374151'}
        metalness={analysis.hasOcean ? 0.8 : 0.2}
        roughness={analysis.hasOcean ? 0.2 : 0.8}
      />
    </mesh>
  );
}

function SceneContent({ 
  text, 
  isPlaying, 
  avatarUrl, 
  gestureCues = [], 
  emotionTimeline = [] 
}: { 
  text: string; 
  isPlaying: boolean;
  avatarUrl?: string;
  gestureCues?: GestureCue[];
  emotionTimeline?: EmotionTimeline[];
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const analysis = useMemo(() => AnalyzeText(text), [text]);

  useFrame((state, delta) => {
    if (isPlaying) {
      setCurrentTime((prev) => prev + delta);
    }
  });

  const lightColor = analysis.isNight
    ? '#4169e1'
    : analysis.isDawn
    ? '#ff6b35'
    : '#ffffff';

  const sphereColor = analysis.hasOcean
    ? '#00ffff'
    : analysis.hasForest
    ? '#00ff00'
    : analysis.hasCity
    ? '#ff00ff'
    : '#ffaa00';

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate={isPlaying}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color={lightColor}
        castShadow
      />
      <pointLight position={[-10, 10, -5]} intensity={0.5} color={lightColor} />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />

      {/* Environment */}
      <Environment preset={analysis.isNight ? 'night' : 'sunset'} />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Ground */}
      <Ground analysis={analysis} />

      {/* Virtual Actor */}
      <VirtualActor
        avatarUrl={avatarUrl}
        gestureCues={gestureCues}
        emotionTimeline={emotionTimeline}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />

      {/* Animated Objects */}
      <AnimatedSphere position={[-4, 2, -2]} color={sphereColor} scale={1.5} />
      <AnimatedSphere position={[-6, 1, -2]} color="#ff6b9d" scale={0.8} />
      <AnimatedSphere position={[4, 1.5, -2]} color="#4ecdc4" scale={1} />
      <AnimatedSphere position={[0, 3, -5]} color="#ffe66d" scale={0.6} />

      {/* Particles */}
      {analysis.hasParticles && <Particles count={200} analysis={analysis} />}

      {/* Fog */}
      <fog attach="fog" args={[analysis.isNight ? '#000033' : '#87ceeb', 10, 50]} />
    </>
  );
}

export default function Scene3D({ 
  text, 
  isPlaying, 
  isMuted, 
  avatarUrl, 
  gestureCues, 
  emotionTimeline 
}: Scene3DProps) {
  return (
    <div className="h-full w-full">
      <Canvas shadows>
        <SceneContent 
          text={text} 
          isPlaying={isPlaying} 
          avatarUrl={avatarUrl}
          gestureCues={gestureCues}
          emotionTimeline={emotionTimeline}
        />
      </Canvas>
    </div>
  );
}
