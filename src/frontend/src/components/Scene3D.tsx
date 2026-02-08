import { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import VirtualActor from './VirtualActor';
import { GestureCue, EmotionTimeline } from '../backend';
import { EmotionAnalysis, getEmotionVisualModifiers } from '../utils/sceneEmotionClassifier';

interface Scene3DProps {
  text: string;
  isPlaying: boolean;
  isMuted: boolean;
  avatarUrl?: string;
  gestureCues?: GestureCue[];
  emotionTimeline?: EmotionTimeline[];
  emotionAnalysis?: EmotionAnalysis | null;
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
  emotionTimeline = [],
  emotionAnalysis
}: { 
  text: string; 
  isPlaying: boolean;
  avatarUrl?: string;
  gestureCues?: GestureCue[];
  emotionTimeline?: EmotionTimeline[];
  emotionAnalysis?: EmotionAnalysis | null;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const analysis = useMemo(() => AnalyzeText(text), [text]);

  useFrame((state, delta) => {
    if (isPlaying) {
      setCurrentTime((prev) => prev + delta);
    }
  });

  // Apply emotion-based visual modifiers
  const visualModifiers = emotionAnalysis 
    ? getEmotionVisualModifiers(emotionAnalysis.emotion, emotionAnalysis.mood)
    : null;

  const baseLightIntensity = analysis.isNight ? 0.5 : analysis.isDawn ? 0.8 : 1.0;
  const emotionLightingMultiplier = visualModifiers?.emotion.lighting || 1.0;
  const moodLightingBoost = visualModifiers?.mood.lightingBoost || 1.0;
  const finalLightIntensity = baseLightIntensity * emotionLightingMultiplier * moodLightingBoost;

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

  // Emotion-based environment preset
  const environmentPreset = emotionAnalysis?.mood === 'dark' 
    ? 'night' 
    : emotionAnalysis?.mood === 'bright' 
    ? 'sunset' 
    : analysis.isNight 
    ? 'night' 
    : 'sunset';

  // Fog color and density based on emotion
  const fogColor = emotionAnalysis?.mood === 'dark' 
    ? '#000033' 
    : emotionAnalysis?.mood === 'bright' 
    ? '#87ceeb' 
    : analysis.isNight 
    ? '#000033' 
    : '#87ceeb';

  const fogDensityMultiplier = visualModifiers?.mood.fogDensity || 1.0;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate={isPlaying}
        autoRotateSpeed={0.5}
      />

      {/* Lighting with emotion-based intensity */}
      <ambientLight intensity={0.3 * emotionLightingMultiplier} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={finalLightIntensity}
        color={lightColor}
        castShadow
      />
      <pointLight 
        position={[-10, 10, -5]} 
        intensity={0.5 * emotionLightingMultiplier} 
        color={lightColor} 
      />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5 * emotionLightingMultiplier}
        castShadow
      />

      {/* Environment with emotion-based preset */}
      <Environment preset={environmentPreset as any} />
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

      {/* Fog with emotion-based density */}
      <fog attach="fog" args={[fogColor, 10 * fogDensityMultiplier, 50 * fogDensityMultiplier]} />
    </>
  );
}

export default function Scene3D({ 
  text, 
  isPlaying, 
  isMuted, 
  avatarUrl, 
  gestureCues, 
  emotionTimeline,
  emotionAnalysis
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
          emotionAnalysis={emotionAnalysis}
        />
      </Canvas>
    </div>
  );
}
