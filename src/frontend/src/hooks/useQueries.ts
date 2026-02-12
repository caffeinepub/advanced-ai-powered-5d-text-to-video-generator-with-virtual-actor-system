import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Video,
  Audio,
  BackgroundMusic,
  SceneConfig,
  UserProfile,
  Avatar,
  AvatarMetadata,
  Gesture,
  Emotion,
  ExternalBlob,
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// Video Queries
export function useGetVideosByCreator(creator: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Video[]>({
    queryKey: ['videos', creator?.toString()],
    queryFn: async () => {
      if (!actor || !creator) return [];
      return actor.getVideosByCreator(creator);
    },
    enabled: !!actor && !isFetching && !!creator,
  });
}

export function useGetVideo(videoId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Video | null>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor || !videoId) return null;
      try {
        return await actor.getVideo(videoId);
      } catch (error) {
        console.error('Failed to fetch video:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useGetSceneConfig(videoId: string | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SceneConfig | null>({
    queryKey: ['sceneConfig', videoId],
    queryFn: async () => {
      if (!actor || !videoId || !identity) return null;
      try {
        const configs = await actor.getSceneConfigsByCreator(identity.getPrincipal());
        return configs.find(c => c.videoId === videoId) || null;
      } catch (error) {
        console.error('Failed to fetch scene config:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!videoId && !!identity,
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: Video) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addVideo(video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useUpdateVideoMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, metadata }: { id: string; metadata: Video['metadata'] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVideoMetadata(id, metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video'] });
    },
  });
}

// Audio Queries
export function useGetAudioByCreator(creator: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Audio[]>({
    queryKey: ['audio', creator?.toString()],
    queryFn: async () => {
      if (!actor || !creator) return [];
      return actor.getAudioByCreator(creator);
    },
    enabled: !!actor && !isFetching && !!creator,
  });
}

export function useAddAudio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (audio: Audio) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAudio(audio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio'] });
    },
  });
}

// Background Music Queries
export function useGetMusicByCreator(creator: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<BackgroundMusic[]>({
    queryKey: ['music', creator?.toString()],
    queryFn: async () => {
      if (!actor || !creator) return [];
      return actor.getMusicByCreator(creator);
    },
    enabled: !!actor && !isFetching && !!creator,
  });
}

export function useAddBackgroundMusic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (music: BackgroundMusic) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBackgroundMusic(music);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music'] });
    },
  });
}

// Scene Config Queries
export function useGetSceneConfigsByCreator(creator: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<SceneConfig[]>({
    queryKey: ['sceneConfigs', creator?.toString()],
    queryFn: async () => {
      if (!actor || !creator) return [];
      return actor.getSceneConfigsByCreator(creator);
    },
    enabled: !!actor && !isFetching && !!creator,
  });
}

export function useAddSceneConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: SceneConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSceneConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sceneConfigs'] });
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Avatar Queries
export function useGetAllAvatars() {
  const { actor, isFetching } = useActor();

  return useQuery<Avatar[]>({
    queryKey: ['avatars'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAvatars();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvatar(avatarId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Avatar | null>({
    queryKey: ['avatar', avatarId],
    queryFn: async () => {
      if (!actor || !avatarId) return null;
      return actor.getAvatar(avatarId);
    },
    enabled: !!actor && !isFetching && !!avatarId,
  });
}

export function useProcessAvatarUpload() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      metadata,
      fileBlob,
    }: {
      metadata: AvatarMetadata;
      fileBlob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processAvatarUpload(metadata, fileBlob);
    },
  });
}

export function useRegisterAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatar: Avatar) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerAvatar(avatar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}

export function useDeleteAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAvatar(avatarId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}

export function useAssignAvatarToUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, avatarId }: { userId: Principal; avatarId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignAvatarToUser(userId, avatarId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRemoveAssignedAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeAssignedAvatar(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Gesture Queries
export function useGetAllGestures() {
  const { actor, isFetching } = useActor();

  return useQuery<Gesture[]>({
    queryKey: ['gestures'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGestures();
    },
    enabled: !!actor && !isFetching,
  });
}

// Emotion Queries
export function useGetAllEmotions() {
  const { actor, isFetching } = useActor();

  return useQuery<Emotion[]>({
    queryKey: ['emotions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmotions();
    },
    enabled: !!actor && !isFetching,
  });
}
