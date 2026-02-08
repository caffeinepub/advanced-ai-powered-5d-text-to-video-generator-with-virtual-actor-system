import { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { GestureCue, EmotionTimeline } from '../backend';

interface VirtualActorProps {
  avatarUrl?: string;
  gestureCues: GestureCue[];
  emotionTimeline: EmotionTimeline[];
  currentTime: number;
  isPlaying: boolean;
}

// Emotion to blendshape mapping - extended to support all emotion types
const EMOTION_BLENDSHAPES: Record<string, Record<string, number>> = {
  happy: {
    mouthSmile: 0.8,
    eyeSquint: 0.3,
    cheekPuff: 0.2,
  },
  joy: {
    mouthSmile: 0.8,
    eyeSquint: 0.3,
    cheekPuff: 0.2,
  },
  sad: {
    mouthFrown: 0.7,
    browInnerUp: 0.6,
    eyeWide: 0.2,
  },
  sadness: {
    mouthFrown: 0.7,
    browInnerUp: 0.6,
    eyeWide: 0.2,
  },
  angry: {
    browDown: 0.8,
    mouthFrown: 0.5,
    jawForward: 0.4,
  },
  anger: {
    browDown: 0.8,
    mouthFrown: 0.5,
    jawForward: 0.4,
  },
  fear: {
    eyeWide: 0.9,
    browInnerUp: 0.7,
    mouthOpen: 0.4,
  },
  calm: {
    mouthSmile: 0.2,
    eyesClosed: 0.1,
  },
  surprise: {
    eyeWide: 1.0,
    browInnerUp: 0.8,
    mouthOpen: 0.7,
    jawDrop: 0.5,
  },
  wonder: {
    eyeWide: 0.6,
    browInnerUp: 0.4,
    mouthSmile: 0.3,
  },
};

// Separate component for loaded avatar
function LoadedAvatar({
  avatarUrl,
  gestureCues,
  emotionTimeline,
  currentTime,
  isPlaying,
}: VirtualActorProps & { avatarUrl: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentGestureRef = useRef<string | null>(null);
  const morphTargetsRef = useRef<THREE.Mesh[]>([]);

  // Load avatar GLB - hook is now always called at top level
  const gltf = useLoader(GLTFLoader, avatarUrl);

  useEffect(() => {
    if (!gltf) return;

    // Setup animation mixer
    if (gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene);
      mixerRef.current = mixer;
    }

    // Find meshes with morph targets for facial animation
    const meshesWithMorphTargets: THREE.Mesh[] = [];
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        meshesWithMorphTargets.push(child);
      }
    });
    morphTargetsRef.current = meshesWithMorphTargets;

    return () => {
      mixerRef.current?.stopAllAction();
    };
  }, [gltf]);

  // Apply emotion to facial blendshapes
  const applyEmotion = (emotion: string, intensity: number) => {
    const blendshapes = EMOTION_BLENDSHAPES[emotion.toLowerCase()];
    if (!blendshapes) return;

    morphTargetsRef.current.forEach((mesh) => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

      Object.entries(blendshapes).forEach(([shapeName, value]) => {
        const dictionary = mesh.morphTargetDictionary;
        const influences = mesh.morphTargetInfluences;
        
        if (!dictionary || !influences) return;
        
        const index = dictionary[shapeName];
        if (index !== undefined) {
          influences[index] = value * intensity;
        }
      });
    });
  };

  // Trigger gesture animation
  const triggerGesture = (gestureName: string) => {
    if (!mixerRef.current || !gltf) return;

    // Find gesture animation clip
    const clip = gltf.animations.find((anim) =>
      anim.name.toLowerCase().includes(gestureName.toLowerCase())
    );

    if (clip) {
      mixerRef.current.stopAllAction();
      const action = mixerRef.current.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      currentGestureRef.current = gestureName;
    }
  };

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Check for gesture cues
    const activeGesture = gestureCues.find(
      (cue) => Math.abs(cue.time - currentTime) < 0.1
    );
    if (activeGesture && activeGesture.gesture !== currentGestureRef.current) {
      triggerGesture(activeGesture.gesture);
    }

    // Apply current emotion
    const activeEmotion = emotionTimeline
      .filter((e) => e.time <= currentTime)
      .sort((a, b) => b.time - a.time)[0];
    
    if (activeEmotion) {
      applyEmotion(activeEmotion.emotion, activeEmotion.intensity);
    }

    // Idle animation - subtle breathing and blinking
    if (groupRef.current && !activeGesture) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} scale={1} />
    </group>
  );
}

// Fallback avatar component
function FallbackAvatar({ isPlaying }: { isPlaying: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && isPlaying) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 32]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.3, 1.2, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0.3, 1.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.15, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
    </group>
  );
}

export default function VirtualActor({
  avatarUrl,
  gestureCues,
  emotionTimeline,
  currentTime,
  isPlaying,
}: VirtualActorProps) {
  // Conditionally render different components based on avatarUrl
  if (avatarUrl) {
    return (
      <LoadedAvatar
        avatarUrl={avatarUrl}
        gestureCues={gestureCues}
        emotionTimeline={emotionTimeline}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />
    );
  }

  return <FallbackAvatar isPlaying={isPlaying} />;
}
