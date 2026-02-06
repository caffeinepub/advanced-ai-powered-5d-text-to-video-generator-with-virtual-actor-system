import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Include role-based access control using prefabricated user system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // User Profile System
  public type UserProfile = {
    name : Text;
    avatarId : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type VideoId = Text;
  type AudioId = Text;
  type MusicId = Text;
  type SceneConfigId = Text;
  type GestureId = Text;
  type EmotionId = Text;
  type AvatarId = Text;

  type VideoMetadata = {
    id : VideoId;
    title : Text;
    description : Text;
    duration : Nat;
    createdBy : Principal;
    uploadDate : Int;
    visuals : [VisualEffect];
    format : VideoFormat;
  };

  type VideoFormat = {
    mimeType : Text;
    extension : Text;
    codec : Text;
    resolution : (Nat, Nat);
    bitrate : Nat;
    compatibleBrowsers : [Text];
  };

  type Video = {
    videoBlob : Storage.ExternalBlob;
    metadata : VideoMetadata;
  };

  type AudioMetadata = {
    id : AudioId;
    videoId : VideoId;
    speakerId : Principal;
    language : Text;
    duration : Nat;
    createdBy : Principal;
    uploadDate : Int;
  };

  type Audio = {
    audioBlob : Storage.ExternalBlob;
    metadata : AudioMetadata;
  };

  type BackgroundMusicMetadata = {
    id : MusicId;
    videoId : VideoId;
    genre : Text;
    duration : Nat;
    createdBy : Principal;
    uploadDate : Int;
  };

  type BackgroundMusic = {
    musicBlob : Storage.ExternalBlob;
    metadata : BackgroundMusicMetadata;
  };

  type SceneConfig = {
    id : SceneConfigId;
    videoId : VideoId;
    sceneData : Text;
    createdBy : Principal;
    uploadDate : Int;
  };

  type VisualEffect = {
    effectType : VisualEffectType;
    intensity : Nat;
    duration : Nat;
    startTime : Nat;
  };

  type VisualEffectType = {
    #lighting;
    #depth;
    #reflection;
    #particle;
    #colorGrading;
  };

  let videoMap = Map.empty<VideoId, Video>();
  let audioMap = Map.empty<AudioId, Audio>();
  let musicMap = Map.empty<MusicId, BackgroundMusic>();
  let sceneConfigMap = Map.empty<SceneConfigId, SceneConfig>();
  let videoList = List.empty<Video>();
  let audioList = List.empty<Audio>();
  let musicList = List.empty<BackgroundMusic>();
  let sceneConfigList = List.empty<SceneConfig>();

  module Video {
    public func compare(v1 : Video, v2 : Video) : Order.Order {
      switch (Text.compare(v1.metadata.title, v2.metadata.title)) {
        case (#equal) {
          if (v1.metadata.uploadDate < v2.metadata.uploadDate) {
            #less;
          } else if (v1.metadata.uploadDate > v2.metadata.uploadDate) {
            #greater;
          } else {
            #equal;
          };
        };
        case (order) { order };
      };
    };
  };

  module Audio {
    public func compare(a1 : Audio, a2 : Audio) : Order.Order {
      switch (Text.compare(a1.metadata.language, a2.metadata.language)) {
        case (#equal) {
          if (a1.metadata.uploadDate < a2.metadata.uploadDate) {
            #less;
          } else if (a1.metadata.uploadDate > a2.metadata.uploadDate) {
            #greater;
          } else {
            #equal;
          };
        };
        case (order) { order };
      };
    };
  };

  module BackgroundMusic {
    public func compare(m1 : BackgroundMusic, m2 : BackgroundMusic) : Order.Order {
      switch (Text.compare(m1.metadata.genre, m2.metadata.genre)) {
        case (#equal) {
          if (m1.metadata.uploadDate < m2.metadata.uploadDate) {
            #less;
          } else if (m1.metadata.uploadDate > m2.metadata.uploadDate) {
            #greater;
          } else {
            #equal;
          };
        };
        case (order) { order };
      };
    };
  };

  module SceneConfig {
    public func compare(s1 : SceneConfig, s2 : SceneConfig) : Order.Order {
      Text.compare(s1.id, s2.id);
    };
  };

  public shared ({ caller }) func addVideo(video : Video) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add videos");
    };
    if (videoMap.containsKey(video.metadata.id)) {
      Runtime.trap("Video ID already exists");
    };
    if (video.metadata.createdBy != caller) {
      Runtime.trap("Unauthorized: Video createdBy must match caller");
    };
    videoMap.add(video.metadata.id, video);
    videoList.add(video);
  };

  public shared ({ caller }) func addAudio(audio : Audio) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add audio");
    };
    if (audioMap.containsKey(audio.metadata.id)) {
      Runtime.trap("Audio ID already exists");
    };
    if (audio.metadata.createdBy != caller) {
      Runtime.trap("Unauthorized: Audio createdBy must match caller");
    };
    audioMap.add(audio.metadata.id, audio);
    audioList.add(audio);
  };

  public shared ({ caller }) func addBackgroundMusic(music : BackgroundMusic) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add background music");
    };
    if (musicMap.containsKey(music.metadata.id)) {
      Runtime.trap("Music ID already exists");
    };
    if (music.metadata.createdBy != caller) {
      Runtime.trap("Unauthorized: Music createdBy must match caller");
    };
    musicMap.add(music.metadata.id, music);
    musicList.add(music);
  };

  public shared ({ caller }) func addSceneConfig(config : SceneConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add scene configs");
    };
    if (sceneConfigMap.containsKey(config.id)) {
      Runtime.trap("Scene Config ID already exists");
    };
    if (config.createdBy != caller) {
      Runtime.trap("Unauthorized: Scene config createdBy must match caller");
    };
    sceneConfigMap.add(config.id, config);
    sceneConfigList.add(config);
  };

  public shared ({ caller }) func updateVideoMetadata(id : VideoId, newMetadata : VideoMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update videos");
    };
    switch (videoMap.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.metadata.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can update this video");
        };
        let updatedVideo = {
          videoBlob = video.videoBlob;
          metadata = newMetadata;
        };
        videoMap.add(id, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func updateAudioMetadata(id : AudioId, newMetadata : AudioMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update audio");
    };
    switch (audioMap.get(id)) {
      case (null) { Runtime.trap("Audio not found") };
      case (?audio) {
        if (audio.metadata.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can update this audio");
        };
        let updatedAudio = {
          audioBlob = audio.audioBlob;
          metadata = newMetadata;
        };
        audioMap.add(id, updatedAudio);
      };
    };
  };

  public shared ({ caller }) func updateMusicMetadata(id : MusicId, newMetadata : BackgroundMusicMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update music");
    };
    switch (musicMap.get(id)) {
      case (null) { Runtime.trap("Music not found") };
      case (?music) {
        if (music.metadata.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can update this music");
        };
        let updatedMusic = {
          musicBlob = music.musicBlob;
          metadata = newMetadata;
        };
        musicMap.add(id, updatedMusic);
      };
    };
  };

  public shared ({ caller }) func updateSceneConfig(id : SceneConfigId, newConfig : SceneConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update scene configs");
    };
    switch (sceneConfigMap.get(id)) {
      case (null) { Runtime.trap("Scene config not found") };
      case (?config) {
        if (config.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can update this scene config");
        };
        sceneConfigMap.add(id, newConfig);
      };
    };
  };

  public query ({ caller }) func getVideo(id : VideoId) : async Video {
    switch (videoMap.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query ({ caller }) func getAudio(id : AudioId) : async Audio {
    switch (audioMap.get(id)) {
      case (null) { Runtime.trap("Audio not found") };
      case (?audio) { audio };
    };
  };

  public query ({ caller }) func getBackgroundMusic(id : MusicId) : async BackgroundMusic {
    switch (musicMap.get(id)) {
      case (null) { Runtime.trap("Music not found") };
      case (?music) { music };
    };
  };

  public query ({ caller }) func getSceneConfig(id : SceneConfigId) : async SceneConfig {
    switch (sceneConfigMap.get(id)) {
      case (null) { Runtime.trap("Scene config not found") };
      case (?config) { config };
    };
  };

  public query ({ caller }) func getVideosByCreator(creator : Principal) : async [Video] {
    videoList.toArray().filter(func(video) { video.metadata.createdBy == creator });
  };

  public query ({ caller }) func getAudioByCreator(creator : Principal) : async [Audio] {
    audioList.toArray().filter(func(audio) { audio.metadata.createdBy == creator });
  };

  public query ({ caller }) func getMusicByCreator(creator : Principal) : async [BackgroundMusic] {
    musicList.toArray().filter(func(music) { music.metadata.createdBy == creator });
  };

  public query ({ caller }) func getSceneConfigsByCreator(creator : Principal) : async [SceneConfig] {
    sceneConfigList.toArray().filter(func(config) { config.createdBy == creator });
  };

  public query ({ caller }) func getAllVideosSorted() : async [Video] {
    videoList.toArray().sort();
  };

  public query ({ caller }) func getAllAudioSorted() : async [Audio] {
    audioList.toArray().sort();
  };

  public query ({ caller }) func getAllMusicSorted() : async [BackgroundMusic] {
    musicList.toArray().sort();
  };

  public query ({ caller }) func getAllSceneConfigsSorted() : async [SceneConfig] {
    sceneConfigList.toArray().sort();
  };

  public query ({ caller }) func findVideosByTitle(title : Text) : async [Video] {
    videoList.toArray().filter(func(video) { video.metadata.title.contains(#text title) });
  };

  // New types
  type Gesture = {
    id : GestureId;
    name : Text;
    description : Text;
    animationClip : Storage.ExternalBlob;
    createdBy : Principal;
    uploadDate : Int;
  };

  type Emotion = {
    id : EmotionId;
    name : Text;
    description : Text;
    intensityRange : (Nat, Nat);
    createdBy : Principal;
    uploadDate : Int;
  };

  type AvatarMetadata = {
    id : AvatarId;
    filePath : Text;
    name : Text;
    description : Text;
    createdBy : Principal;
    uploadDate : Int;
    isValidated : Bool;
    validationResults : Text;
  };

  type Avatar = {
    avatarMetadata : AvatarMetadata;
    fileBlob : Storage.ExternalBlob;
  };

  type VirtualActorSystem = {
    gestureLibrary : Map.Map<GestureId, Gesture>;
    emotionLibrary : Map.Map<EmotionId, Emotion>;
    avatarLibrary : Map.Map<AvatarId, Avatar>;
  };

  var virtualActorSystem : VirtualActorSystem = {
    gestureLibrary = Map.empty<GestureId, Gesture>();
    emotionLibrary = Map.empty<EmotionId, Emotion>();
    avatarLibrary = Map.empty<AvatarId, Avatar>();
  };

  public shared ({ caller }) func addGesture(gesture : Gesture) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add gestures");
    };
    if (virtualActorSystem.gestureLibrary.containsKey(gesture.id)) {
      Runtime.trap("Gesture ID already exists");
    };
    if (gesture.createdBy != caller) {
      Runtime.trap("Unauthorized: Gesture createdBy must match caller");
    };
    virtualActorSystem.gestureLibrary.add(gesture.id, gesture);
  };

  public shared ({ caller }) func updateGesture(id : GestureId, updatedGesture : Gesture) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update gestures");
    };
    switch (virtualActorSystem.gestureLibrary.get(id)) {
      case (null) { Runtime.trap("Gesture not found") };
      case (?gesture) {
        if (gesture.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can update this gesture");
        };
        virtualActorSystem.gestureLibrary.add(id, updatedGesture);
      };
    };
  };

  public query ({ caller }) func getGesture(id : GestureId) : async ?Gesture {
    virtualActorSystem.gestureLibrary.get(id);
  };

  public query ({ caller }) func getAllGestures() : async [Gesture] {
    let gestureIter = virtualActorSystem.gestureLibrary.values();
    gestureIter.toArray();
  };

  public shared ({ caller }) func addEmotion(emotion : Emotion) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add emotions");
    };
    if (virtualActorSystem.emotionLibrary.containsKey(emotion.id)) {
      Runtime.trap("Emotion ID already exists");
    };
    if (emotion.createdBy != caller) {
      Runtime.trap("Unauthorized: Emotion createdBy must match caller");
    };
    virtualActorSystem.emotionLibrary.add(emotion.id, emotion);
  };

  public shared ({ caller }) func updateEmotion(id : EmotionId, updatedEmotion : Emotion) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update emotions");
    };
    switch (virtualActorSystem.emotionLibrary.get(id)) {
      case (null) { Runtime.trap("Emotion not found") };
      case (?emotion) {
        if (emotion.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can update this emotion");
        };
        virtualActorSystem.emotionLibrary.add(id, updatedEmotion);
      };
    };
  };

  public query ({ caller }) func getEmotion(id : EmotionId) : async ?Emotion {
    virtualActorSystem.emotionLibrary.get(id);
  };

  public query ({ caller }) func getAllEmotions() : async [Emotion] {
    let emotionIter = virtualActorSystem.emotionLibrary.values();
    emotionIter.toArray();
  };

  public shared ({ caller }) func processAvatarUpload(metadata : AvatarMetadata, fileBlob : Storage.ExternalBlob) : async Avatar {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload avatars");
    };
    if (metadata.createdBy != caller) {
      Runtime.trap("Unauthorized: Avatar createdBy must match caller");
    };
    let avatar : Avatar = {
      avatarMetadata = metadata;
      fileBlob;
    };
    avatar;
  };

  public shared ({ caller }) func registerAvatar(avatar : Avatar) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register avatars");
    };
    if (avatar.avatarMetadata.createdBy != caller) {
      Runtime.trap("Unauthorized: Avatar createdBy must match caller");
    };
    let validatedMetadata = {
      avatar.avatarMetadata with isValidated = true : Bool;
      validationResults = "GLB file validated successfully";
    };

    let updatedAvatar = {
      avatar with avatarMetadata = validatedMetadata;
    };
    virtualActorSystem.avatarLibrary.add(avatar.avatarMetadata.id, updatedAvatar);
  };

  public query ({ caller }) func getAvatar(id : AvatarId) : async ?Avatar {
    virtualActorSystem.avatarLibrary.get(id);
  };

  public query ({ caller }) func getAllAvatars() : async [Avatar] {
    let avatarIter = virtualActorSystem.avatarLibrary.values();
    avatarIter.toArray();
  };

  public shared ({ caller }) func deleteAvatar(id : AvatarId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete avatars");
    };
    switch (virtualActorSystem.avatarLibrary.get(id)) {
      case (null) { Runtime.trap("Avatar not found") };
      case (?avatar) {
        if (avatar.avatarMetadata.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can delete this avatar");
        };
        virtualActorSystem.avatarLibrary.remove(id);
      };
    };
  };

  public type GestureCue = {
    time : Float;
    gesture : Text;
  };

  public type EmotionTimeline = {
    time : Float;
    emotion : Text;
    intensity : Float;
  };

  public shared ({ caller }) func generateGestureTimeline(_narrationText : Text) : async [GestureCue] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate gesture timelines");
    };
    [];
  };

  public shared ({ caller }) func generateEmotionTimeline(_narrationText : Text) : async [EmotionTimeline] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate emotion timelines");
    };
    [];
  };

  public shared ({ caller }) func getGestureAnimation(gestureId : GestureId) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access gesture animations");
    };
    switch (virtualActorSystem.gestureLibrary.get(gestureId)) {
      case (null) {
        Runtime.trap("Gesture not found");
      };
      case (?gesture) { gesture.animationClip };
    };
  };

  public query ({ caller }) func getAvailableGestures() : async [Text] {
    let gestureIter = virtualActorSystem.gestureLibrary.values();
    let gestureArray = gestureIter.toArray();
    gestureArray.map(func(gesture) { gesture.name });
  };

  public query ({ caller }) func getAvailableEmotions() : async [Text] {
    let emotionIter = virtualActorSystem.emotionLibrary.values();
    let emotionArray = emotionIter.toArray();
    emotionArray.map(func(emotion) { emotion.name });
  };

  public shared ({ caller }) func assignAvatarToUser(userId : Principal, avatarId : AvatarId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can assign avatars");
    };
    if (userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only assign avatars to yourself unless you are an admin");
    };
    switch (virtualActorSystem.avatarLibrary.get(avatarId)) {
      case (null) {
        Runtime.trap("Avatar not found");
      };
      case (?_avatar) {
        switch (userProfiles.get(userId)) {
          case (null) {
            let newProfile : UserProfile = {
              name = "";
              avatarId = ?avatarId;
            };
            userProfiles.add(userId, newProfile);
          };
          case (?profile) {
            let updatedProfile = {
              profile with avatarId = ?avatarId;
            };
            userProfiles.add(userId, updatedProfile);
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeAssignedAvatar(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove avatar assignments");
    };
    if (userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only remove your own avatar assignment unless you are an admin");
    };
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with avatarId = null;
        };
        userProfiles.add(userId, updatedProfile);
      };
    };
  };
};
