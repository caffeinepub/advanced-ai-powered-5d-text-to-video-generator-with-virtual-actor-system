# Advanced AI Powered 5D Text to Video Generator with Virtual Actor System

## Overview
A text-to-video generator application that converts user text input into animated 3D scenes with synchronized audio narration, background music, and AI-driven virtual actors performing realistic gestures, emotions, and lip-sync.

## Core Features

### Text-to-Scene Generation
- Users input descriptive text through a simple text area interface
- The application converts text into animated 3D environments using React Three Fiber
- Scenes visually represent the story or description provided by the user
- 3D environments include immersive visual effects: dynamic lighting, depth perception, reflections, and particle systems

### Virtual Actor System

#### Gesture AI System
- Intent detection module analyzes narration text to generate gesture cue JSON format: `[ { time: number, gesture: string } ]`
- Gesture library supporting GLB animation clips stored in blob storage (explain.glb, point.glb, wave.glb, etc.)
- GestureController component synchronizes gesture animations with narration timeline using React Three Fiber animation mixer
- Hand, head, and body movements align precisely with narration timing

#### Emotion Engine
- Emotion detection from narration text generates emotion timeline JSON: `[ { time, emotion, intensity } ]`
- Five primary emotions supported: happy, sad, angry, fear, calm
- Emotion mappings affect avatar facial blendshapes and body posture animations
- Real-time emotion application synchronized with narration playback

#### Ready Avatar System
- Avatar upload and management for GLB files from Ready Player Me, VRoid, and Mixamo
- Automatic validation for blendshapes, ARKit visemes, body skeleton, and facial rig compatibility
- Avatar registration pipeline for AI-driven performance integration
- Avatar testing and assignment functionality

### Audio Generation
- Automatic voice narration generation synchronized with the text input
- Background music creation that matches the tone and mood of the generated scene
- Audio elements are timed to align with the 3D animation sequence and avatar performances

### User Interface
- Simple, clean interface with a text input area for user descriptions
- Avatar Setup screen for uploading, testing, and assigning avatars
- Preview functionality to view generated videos with animated avatars before saving
- Download/save options for completed videos with virtual actor performances
- Progress indicators during video generation process
- Video library with enhanced browser-compatible playbook using HTML5 video elements

### Video Output
- Generated videos combine 3D animated scenes with synchronized audio narration, background music, and virtual actor performances
- Videos feature 5D-style visual effects including advanced lighting, depth, reflections, and particle layers
- Virtual actors perform realistic gestures, emotions, and lip-sync synchronized with narration

## Enhanced Video Playback System

### Video Compatibility Features
- Automatic MIME type detection using blob metadata for generated videos
- Support for MP4, WebM, and MOV video formats with fallback detection
- MediaSource API integration for converting unsupported or corrupted video blobs to compatible MP4 streams
- Blob URL management with automatic revocation and recreation for retry scenarios
- Friendly error messaging with retry options when video playback fails
- Format compatibility validation before attempting video playback

### VideoLibrary Component Enhancements
- Enhanced video player with automatic format detection and conversion
- Retry mechanism for failed video playback with blob URL recreation
- Error handling with user-friendly messages for unsupported formats
- Fallback playback options when primary format fails

### ScenePreview Component Enhancements
- Real-time video format validation during preview generation
- Automatic conversion of preview videos to browser-compatible formats
- Error recovery system for preview playback failures
- Seamless format switching without user intervention

## Technical Requirements

### Frontend
- 3D scene rendering and animation using React Three Fiber
- Avatar rendering with blendshape and skeleton animation support
- GestureController component with animation mixer for gesture playback
- Emotion application system for facial and body animation control
- Avatar upload interface with GLB file validation
- Real-time preview of generated content with avatar performances
- Enhanced video export functionality with format compatibility checking
- Advanced video playback system with MediaSource API integration
- Audio playback and synchronization with avatar lip-sync
- User interface for text input, avatar management, and video management
- Browser-compatible video playback using HTML5 video tags with fallback support
- State management for gestures, emotions, and avatar references
- Video format detection and conversion capabilities
- Error handling and retry mechanisms for video playback

### Backend
- Text processing and scene interpretation
- Intent detection for gesture cue generation from narration text
- Emotion detection and timeline generation from narration analysis
- AI integration for voice narration generation
- Background music generation based on text mood/tone analysis
- Avatar GLB file processing and validation pipeline
- Gesture animation GLB storage and serving
- Enhanced video rendering and compilation services with format metadata
- Video format optimization for browser compatibility
- MIME type detection and metadata generation for video files
- Storage of generated videos, avatars, and animation assets with format information

## Data Storage
The backend stores:
- User-generated text inputs
- Generated video files with virtual actor performances and format metadata
- Audio files (narration and background music)
- Scene configuration data for reproducibility
- Avatar GLB files with validation metadata
- Gesture animation GLB clips
- Generated gesture cue and emotion timeline JSON data
- Video metadata including MIME type, format, and compatibility information

## Avatar System Requirements
- Support for Ready Player Me, VRoid, and Mixamo GLB avatar formats
- Automatic rig validation for blendshapes, ARKit visemes, body skeleton, and facial rig
- Avatar performance pipeline integrating gesture, emotion, and lip-sync systems
- Real-time avatar animation synchronized with narration timeline
- Avatar library management with upload, testing, and assignment capabilities
