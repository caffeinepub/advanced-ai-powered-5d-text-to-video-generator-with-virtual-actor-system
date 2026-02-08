import VideoLibrary from '../components/VideoLibrary';

export default function LibraryPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold">Video Library</h1>
          <p className="text-lg text-muted-foreground">
            Manage and download all your created videos
          </p>
        </div>

        <VideoLibrary />
      </div>
    </div>
  );
}
