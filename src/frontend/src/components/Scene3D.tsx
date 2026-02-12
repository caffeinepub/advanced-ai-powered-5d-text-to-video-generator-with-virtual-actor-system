import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import VirtualActor from './VirtualActor';
import { GestureCue, EmotionTimeline } from '../backend';
import { GenerationSettings } from '../utils/generationSettings';

export interface Scene3DHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

interface Scene3DProps {
  text: string;
  gestureCues: GestureCue[];
  emotionTimeline: EmotionTimeline[];
  avatarUrl?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  settings?: GenerationSettings;
}

function SceneContent({
  text,
  gestureCues,
  emotionTimeline,
  avatarUrl,
  settings,
}: Omit<Scene3DProps, 'onCanvasReady'>) {
  const { scene, camera, gl } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Apply style preset to scene
    if (settings?.stylePreset) {
      switch (settings.stylePreset) {
        case 'cinematic':
          scene.fog = new THREE.Fog(0x1a1a2e, 5, 15);
          if (ambientLightRef.current) ambientLightRef.current.intensity = 0.3;
          break;
        case 'vibrant':
          scene.fog = null;
          if (ambientLightRef.current) ambientLightRef.current.intensity = 0.8;
          break;
        case 'minimal':
          scene.fog = null;
          scene.background = new THREE.Color(0xf5f5f5);
          if (ambientLightRef.current) ambientLightRef.current.intensity = 0.6;
          break;
        case 'dramatic':
          scene.fog = new THREE.Fog(0x000000, 3, 10);
          if (ambientLightRef.current) ambientLightRef.current.intensity = 0.2;
          break;
        case 'natural':
        default:
          scene.fog = null;
          if (ambientLightRef.current) ambientLightRef.current.intensity = 0.5;
          break;
      }
    }
  }, [settings?.stylePreset, scene]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Update current time for virtual actor
    setCurrentTime(time);
    
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(time * 0.5) * 3;
      lightRef.current.position.z = Math.cos(time * 0.5) * 3;
    }
  });

  const getEmotionColor = () => {
    if (emotionTimeline.length === 0) return '#7042f8';
    
    const currentEmotion = emotionTimeline[0].emotion;
    const emotionColors: Record<string, string> = {
      fear: '#8b5cf6',
      joy: '#fbbf24',
      calm: '#60a5fa',
      sadness: '#6366f1',
      anger: '#ef4444',
      surprise: '#f59e0b',
      wonder: '#a78bfa',
    };
    
    return emotionColors[currentEmotion] || '#7042f8';
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={50} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2}
      />

      <ambientLight ref={ambientLightRef} intensity={0.5} />
      <pointLight
        ref={lightRef}
        position={[2, 3, 2]}
        intensity={1.5}
        color={getEmotionColor()}
        castShadow
      />
      <directionalLight position={[-2, 2, 2]} intensity={0.5} />

      {avatarUrl ? (
        <VirtualActor
          avatarUrl={avatarUrl}
          gestureCues={gestureCues}
          emotionTimeline={emotionTimeline}
          currentTime={currentTime}
          isPlaying={isPlaying}
        />
      ) : (
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color={getEmotionColor()} />
        </mesh>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <gridHelper args={[20, 20, '#444', '#222']} position={[0, 0.01, 0]} />
    </>
  );
}

const Scene3D = forwardRef<Scene3DHandle, Scene3DProps>(
  ({ text, gestureCues, emotionTimeline, avatarUrl, onCanvasReady, settings }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    return (
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
          if (onCanvasReady) {
            onCanvasReady(gl.domElement);
          }
        }}
      >
        <SceneContent
          text={text}
          gestureCues={gestureCues}
          emotionTimeline={emotionTimeline}
          avatarUrl={avatarUrl}
          settings={settings}
        />
      </Canvas>
    );
  }
);

Scene3D.displayName = 'Scene3D';

export default Scene3D;
