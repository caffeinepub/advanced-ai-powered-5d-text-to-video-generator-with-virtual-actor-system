import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type VideoId = Text;
  type AudioId = Text;
  type MusicId = Text;
  type SceneConfigId = Text;
  type GestureId = Text;
  type EmotionId = Text;
  type AvatarId = Text;

  type OldVideoMetadata = {
    id : VideoId;
    title : Text;
    description : Text;
    duration : Nat;
    createdBy : Principal;
    uploadDate : Int;
    visuals : [VisualEffect];
  };

  type VideoFormat = {
    mimeType : Text;
    extension : Text;
    codec : Text;
    resolution : (Nat, Nat);
    bitrate : Nat;
    compatibleBrowsers : [Text];
  };

  type VisualEffect = {
    effectType : {
      #lighting;
      #depth;
      #reflection;
      #particle;
      #colorGrading;
    };
    intensity : Nat;
    duration : Nat;
    startTime : Nat;
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

  type BackgroundMusicMetadata = {
    id : MusicId;
    videoId : VideoId;
    genre : Text;
    duration : Nat;
    createdBy : Principal;
    uploadDate : Int;
  };

  type SceneConfig = {
    id : SceneConfigId;
    videoId : VideoId;
    sceneData : Text;
    createdBy : Principal;
    uploadDate : Int;
  };

  type Audio = {
    audioBlob : Blob;
    metadata : AudioMetadata;
  };

  type BackgroundMusic = {
    musicBlob : Blob;
    metadata : BackgroundMusicMetadata;
  };

  type Video = {
    videoBlob : Blob;
    metadata : OldVideoMetadata;
  };

  // define old actor type
  type OldActor = {
    videoMap : Map.Map<VideoId, Video>;
    videoList : List.List<Video>;
  };

  // define new actor type with new VideoMetadata definition and new fields
  type NewActor = {
    videoMap : Map.Map<VideoId, {
      videoBlob : Blob;
      metadata : {
        id : VideoId;
        title : Text;
        description : Text;
        duration : Nat;
        createdBy : Principal;
        uploadDate : Int;
        visuals : [VisualEffect];
        format : VideoFormat;
      };
    }>;
    videoList : List.List<{
      videoBlob : Blob;
      metadata : {
        id : VideoId;
        title : Text;
        description : Text;
        duration : Nat;
        createdBy : Principal;
        uploadDate : Int;
        visuals : [VisualEffect];
        format : VideoFormat;
      };
    }>;
  };

  public func run(old : OldActor) : NewActor {
    let newVideoMap = old.videoMap.map<VideoId, Video, {
      videoBlob : Blob;
      metadata : {
        id : VideoId;
        title : Text;
        description : Text;
        duration : Nat;
        createdBy : Principal;
        uploadDate : Int;
        visuals : [VisualEffect];
        format : VideoFormat;
      };
    }>(
      func(_id, oldVideo) {
        {
          videoBlob = oldVideo.videoBlob;
          metadata = {
            id = oldVideo.metadata.id;
            title = oldVideo.metadata.title;
            description = oldVideo.metadata.description;
            duration = oldVideo.metadata.duration;
            createdBy = oldVideo.metadata.createdBy;
            uploadDate = oldVideo.metadata.uploadDate;
            visuals = oldVideo.metadata.visuals;
            format = {
              mimeType = "video/mp4";
              extension = ".mp4";
              codec = "H.264";
              resolution = (1920, 1080);
              bitrate = 5000;
              compatibleBrowsers = ["Chrome", "Firefox", "Safari", "Edge"];
            };
          };
        };
      }
    );

    let newVideoList = old.videoList.map<Video, {
      videoBlob : Blob;
      metadata : {
        id : VideoId;
        title : Text;
        description : Text;
        duration : Nat;
        createdBy : Principal;
        uploadDate : Int;
        visuals : [VisualEffect];
        format : VideoFormat;
      };
    }>(
      func(oldVideo) {
        {
          videoBlob = oldVideo.videoBlob;
          metadata = {
            id = oldVideo.metadata.id;
            title = oldVideo.metadata.title;
            description = oldVideo.metadata.description;
            duration = oldVideo.metadata.duration;
            createdBy = oldVideo.metadata.createdBy;
            uploadDate = oldVideo.metadata.uploadDate;
            visuals = oldVideo.metadata.visuals;
            format = {
              mimeType = "video/mp4";
              extension = ".mp4";
              codec = "H.264";
              resolution = (1920, 1080);
              bitrate = 5000;
              compatibleBrowsers = ["Chrome", "Firefox", "Safari", "Edge"];
            };
          };
        };
      }
    );

    {
      videoMap = newVideoMap;
      videoList = newVideoList;
    };
  };
};
