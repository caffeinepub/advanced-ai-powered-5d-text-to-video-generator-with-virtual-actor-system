import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { 
  Video, 
  Audio, 
  BackgroundMusic, 
  SceneConfig, 
  Avatar, 
  AvatarMetadata, 
  Gesture, 
  Emotion,
  GestureCue,
  EmotionTimeline,
  UserProfile
} from '../backend';
import { ExternalBlob } from '../backend';

// Video queries
export function useGetAllVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideosSorted();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserVideos() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Video[]>({
    queryKey: ['userVideos', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getVideosByCreator(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetVideo(videoId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Video | null>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor || !videoId) return null;
      return actor.getVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: Video) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addVideo(video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['userVideos'] });
    },
  });
}

export function useAddAudio() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (audio: Audio) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addAudio(audio);
    },
  });
}

export function useAddBackgroundMusic() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (music: BackgroundMusic) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addBackgroundMusic(music);
    },
  });
}

export function useAddSceneConfig() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (config: SceneConfig) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addSceneConfig(config);
    },
  });
}

// User Profile queries
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
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Avatar queries
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
    mutationFn: async ({ metadata, fileBlob }: { metadata: AvatarMetadata; fileBlob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.processAvatarUpload(metadata, fileBlob);
    },
  });
}

export function useRegisterAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatar: Avatar) => {
      if (!actor) throw new Error('Actor not initialized');
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
      if (!actor) throw new Error('Actor not initialized');
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
    mutationFn: async ({ userId, avatarId }: { userId: any; avatarId: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.assignAvatarToUser(userId, avatarId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Gesture queries
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

export function useAddGesture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gesture: Gesture) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addGesture(gesture);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestures'] });
    },
  });
}

export function useGenerateGestureTimeline() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (narrationText: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.generateGestureTimeline(narrationText);
    },
  });
}

// Emotion queries
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

export function useAddEmotion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emotion: Emotion) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addEmotion(emotion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emotions'] });
    },
  });
}

export function useGenerateEmotionTimeline() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (narrationText: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.generateEmotionTimeline(narrationText);
    },
  });
}
