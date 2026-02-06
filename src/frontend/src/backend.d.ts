import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    metadata: VideoMetadata;
    videoBlob: ExternalBlob;
}
export interface UserProfile {
    name: string;
    avatarId?: string;
}
export interface VisualEffect {
    startTime: bigint;
    duration: bigint;
    effectType: VisualEffectType;
    intensity: bigint;
}
export interface VideoFormat {
    codec: string;
    compatibleBrowsers: Array<string>;
    mimeType: string;
    resolution: [bigint, bigint];
    extension: string;
    bitrate: bigint;
}
export type AvatarId = string;
export interface GestureCue {
    time: number;
    gesture: string;
}
export interface Gesture {
    id: GestureId;
    animationClip: ExternalBlob;
    name: string;
    createdBy: Principal;
    description: string;
    uploadDate: bigint;
}
export type GestureId = string;
export interface Emotion {
    id: EmotionId;
    name: string;
    createdBy: Principal;
    description: string;
    uploadDate: bigint;
    intensityRange: [bigint, bigint];
}
export type VideoId = string;
export interface BackgroundMusicMetadata {
    id: MusicId;
    duration: bigint;
    createdBy: Principal;
    genre: string;
    uploadDate: bigint;
    videoId: VideoId;
}
export type SceneConfigId = string;
export interface AudioMetadata {
    id: AudioId;
    duration: bigint;
    createdBy: Principal;
    language: string;
    speakerId: Principal;
    uploadDate: bigint;
    videoId: VideoId;
}
export interface Avatar {
    avatarMetadata: AvatarMetadata;
    fileBlob: ExternalBlob;
}
export type MusicId = string;
export interface AvatarMetadata {
    id: AvatarId;
    isValidated: boolean;
    validationResults: string;
    name: string;
    createdBy: Principal;
    description: string;
    filePath: string;
    uploadDate: bigint;
}
export type EmotionId = string;
export interface SceneConfig {
    id: SceneConfigId;
    createdBy: Principal;
    sceneData: string;
    uploadDate: bigint;
    videoId: VideoId;
}
export interface Audio {
    metadata: AudioMetadata;
    audioBlob: ExternalBlob;
}
export interface EmotionTimeline {
    emotion: string;
    time: number;
    intensity: number;
}
export interface BackgroundMusic {
    metadata: BackgroundMusicMetadata;
    musicBlob: ExternalBlob;
}
export interface VideoMetadata {
    id: VideoId;
    title: string;
    duration: bigint;
    createdBy: Principal;
    description: string;
    visuals: Array<VisualEffect>;
    uploadDate: bigint;
    format: VideoFormat;
}
export type AudioId = string;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VisualEffectType {
    particle = "particle",
    lighting = "lighting",
    colorGrading = "colorGrading",
    depth = "depth",
    reflection = "reflection"
}
export interface backendInterface {
    addAudio(audio: Audio): Promise<void>;
    addBackgroundMusic(music: BackgroundMusic): Promise<void>;
    addEmotion(emotion: Emotion): Promise<void>;
    addGesture(gesture: Gesture): Promise<void>;
    addSceneConfig(config: SceneConfig): Promise<void>;
    addVideo(video: Video): Promise<void>;
    assignAvatarToUser(userId: Principal, avatarId: AvatarId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAvatar(id: AvatarId): Promise<void>;
    findVideosByTitle(title: string): Promise<Array<Video>>;
    generateEmotionTimeline(_narrationText: string): Promise<Array<EmotionTimeline>>;
    generateGestureTimeline(_narrationText: string): Promise<Array<GestureCue>>;
    getAllAudioSorted(): Promise<Array<Audio>>;
    getAllAvatars(): Promise<Array<Avatar>>;
    getAllEmotions(): Promise<Array<Emotion>>;
    getAllGestures(): Promise<Array<Gesture>>;
    getAllMusicSorted(): Promise<Array<BackgroundMusic>>;
    getAllSceneConfigsSorted(): Promise<Array<SceneConfig>>;
    getAllVideosSorted(): Promise<Array<Video>>;
    getAudio(id: AudioId): Promise<Audio>;
    getAudioByCreator(creator: Principal): Promise<Array<Audio>>;
    getAvailableEmotions(): Promise<Array<string>>;
    getAvailableGestures(): Promise<Array<string>>;
    getAvatar(id: AvatarId): Promise<Avatar | null>;
    getBackgroundMusic(id: MusicId): Promise<BackgroundMusic>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmotion(id: EmotionId): Promise<Emotion | null>;
    getGesture(id: GestureId): Promise<Gesture | null>;
    getGestureAnimation(gestureId: GestureId): Promise<ExternalBlob>;
    getMusicByCreator(creator: Principal): Promise<Array<BackgroundMusic>>;
    getSceneConfig(id: SceneConfigId): Promise<SceneConfig>;
    getSceneConfigsByCreator(creator: Principal): Promise<Array<SceneConfig>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: VideoId): Promise<Video>;
    getVideosByCreator(creator: Principal): Promise<Array<Video>>;
    isCallerAdmin(): Promise<boolean>;
    processAvatarUpload(metadata: AvatarMetadata, fileBlob: ExternalBlob): Promise<Avatar>;
    registerAvatar(avatar: Avatar): Promise<void>;
    removeAssignedAvatar(userId: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAudioMetadata(id: AudioId, newMetadata: AudioMetadata): Promise<void>;
    updateEmotion(id: EmotionId, updatedEmotion: Emotion): Promise<void>;
    updateGesture(id: GestureId, updatedGesture: Gesture): Promise<void>;
    updateMusicMetadata(id: MusicId, newMetadata: BackgroundMusicMetadata): Promise<void>;
    updateSceneConfig(id: SceneConfigId, newConfig: SceneConfig): Promise<void>;
    updateVideoMetadata(id: VideoId, newMetadata: VideoMetadata): Promise<void>;
}
