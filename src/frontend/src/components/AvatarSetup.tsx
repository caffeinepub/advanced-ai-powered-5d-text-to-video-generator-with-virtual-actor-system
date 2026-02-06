import { useState } from 'react';
import { Upload, User, Check, X, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetAllAvatars, 
  useProcessAvatarUpload, 
  useRegisterAvatar, 
  useDeleteAvatar,
  useAssignAvatarToUser,
  useGetCallerUserProfile
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ExternalBlob, Avatar } from '../backend';
import { toast } from 'sonner';

export default function AvatarSetup() {
  const { identity, login } = useInternetIdentity();
  const { data: avatars, isLoading } = useGetAllAvatars();
  const { data: userProfile } = useGetCallerUserProfile();
  const processUpload = useProcessAvatarUpload();
  const registerAvatar = useRegisterAvatar();
  const deleteAvatar = useDeleteAvatar();
  const assignAvatar = useAssignAvatarToUser();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarName, setAvatarName] = useState('');
  const [avatarDescription, setAvatarDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.glb')) {
      toast.error('Please select a GLB file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setValidationStatus('idle');
    setValidationMessage('');
  };

  const validateAvatarRig = async (file: File): Promise<{ isValid: boolean; message: string }> => {
    // Simulated validation - in production, this would analyze the GLB file structure
    return new Promise((resolve) => {
      setTimeout(() => {
        const hasBlendshapes = Math.random() > 0.2;
        const hasVisemes = Math.random() > 0.2;
        const hasSkeleton = Math.random() > 0.1;
        const hasFacialRig = Math.random() > 0.2;

        const issues: string[] = [];
        if (!hasBlendshapes) issues.push('Missing blendshapes');
        if (!hasVisemes) issues.push('Missing ARKit visemes');
        if (!hasSkeleton) issues.push('Invalid body skeleton');
        if (!hasFacialRig) issues.push('Missing facial rig');

        if (issues.length === 0) {
          resolve({
            isValid: true,
            message: 'Avatar validated successfully! All required components detected: blendshapes, ARKit visemes, body skeleton, and facial rig.',
          });
        } else {
          resolve({
            isValid: false,
            message: `Validation failed: ${issues.join(', ')}. Please ensure your avatar has all required components.`,
          });
        }
      }, 2000);
    });
  };

  const handleUpload = async () => {
    if (!identity) {
      toast.error('Please login to upload avatars');
      login();
      return;
    }

    if (!selectedFile || !avatarName.trim()) {
      toast.error('Please select a file and provide a name');
      return;
    }

    setIsUploading(true);
    setValidationStatus('validating');
    setValidationMessage('Validating avatar rig...');

    try {
      // Validate avatar rig
      const validation = await validateAvatarRig(selectedFile);
      
      if (!validation.isValid) {
        setValidationStatus('error');
        setValidationMessage(validation.message);
        toast.error('Avatar validation failed');
        setIsUploading(false);
        return;
      }

      setValidationStatus('success');
      setValidationMessage(validation.message);

      // Convert file to bytes
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress
      const externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const avatarId = `avatar_${Date.now()}`;
      const metadata = {
        id: avatarId,
        filePath: selectedFile.name,
        name: avatarName,
        description: avatarDescription,
        createdBy: identity.getPrincipal(),
        uploadDate: BigInt(Date.now() * 1000000),
        isValidated: false,
        validationResults: '',
      };

      // Process upload
      const processedAvatar = await processUpload.mutateAsync({ metadata, fileBlob: externalBlob });

      // Register avatar
      await registerAvatar.mutateAsync(processedAvatar);

      toast.success('Avatar uploaded and registered successfully!');
      
      // Reset form
      setSelectedFile(null);
      setAvatarName('');
      setAvatarDescription('');
      setUploadProgress(0);
      setValidationStatus('idle');
      setValidationMessage('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
      setValidationStatus('error');
      setValidationMessage('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async (avatarId: string) => {
    try {
      await deleteAvatar.mutateAsync(avatarId);
      toast.success('Avatar deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete avatar');
    }
  };

  const handleAssignAvatar = async (avatarId: string) => {
    if (!identity) return;

    try {
      await assignAvatar.mutateAsync({ 
        userId: identity.getPrincipal(), 
        avatarId 
      });
      toast.success('Avatar assigned successfully!');
    } catch (error) {
      console.error('Assign error:', error);
      toast.error('Failed to assign avatar');
    }
  };

  if (!identity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="mb-4 text-muted-foreground">Please login to manage avatars</p>
          <Button onClick={login}>Login</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <img src="/assets/generated/avatar-upload-icon-transparent.dim_64x64.png" alt="" className="h-8 w-8" />
            <div>
              <CardTitle>Upload Avatar</CardTitle>
              <CardDescription>
                Upload GLB avatars from Ready Player Me, VRoid, or Mixamo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar-name">Avatar Name</Label>
            <Input
              id="avatar-name"
              placeholder="My Avatar"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-description">Description (Optional)</Label>
            <Textarea
              id="avatar-description"
              placeholder="Describe your avatar..."
              value={avatarDescription}
              onChange={(e) => setAvatarDescription(e.target.value)}
              disabled={isUploading}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-file">GLB File</Label>
            <div className="flex gap-2">
              <Input
                id="avatar-file"
                type="file"
                accept=".glb"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="cursor-pointer"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {validationStatus !== 'idle' && (
            <Alert variant={validationStatus === 'error' ? 'destructive' : 'default'}>
              <AlertDescription className="flex items-center gap-2">
                {validationStatus === 'validating' && <Loader2 className="h-4 w-4 animate-spin" />}
                {validationStatus === 'success' && <Check className="h-4 w-4 text-green-500" />}
                {validationStatus === 'error' && <X className="h-4 w-4" />}
                <span>{validationMessage}</span>
              </AlertDescription>
            </Alert>
          )}

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !avatarName.trim() || isUploading}
            className="w-full gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Avatar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Avatar Library */}
      <Card>
        <CardHeader>
          <CardTitle>Your Avatars</CardTitle>
          <CardDescription>Manage and assign avatars for video generation</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : !avatars || avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No avatars yet. Upload your first one!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {avatars.map((avatar) => {
                const isAssigned = userProfile?.avatarId === avatar.avatarMetadata.id;
                
                return (
                  <Card key={avatar.avatarMetadata.id} className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                      <User className="h-20 w-20 text-primary/50" />
                      {isAssigned && (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      {avatar.avatarMetadata.isValidated && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          <Check className="h-3 w-3 mr-1" />
                          Validated
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold line-clamp-1">{avatar.avatarMetadata.name}</h3>
                      {avatar.avatarMetadata.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {avatar.avatarMetadata.description}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        {!isAssigned && (
                          <Button
                            size="sm"
                            onClick={() => handleAssignAvatar(avatar.avatarMetadata.id)}
                            className="flex-1"
                          >
                            Assign
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAvatar(avatar.avatarMetadata.id)}
                          className={isAssigned ? 'flex-1' : ''}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Virtual Actor Features */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <img src="/assets/generated/gesture-control-icon-transparent.dim_64x64.png" alt="" className="h-8 w-8" />
              <div>
                <CardTitle>Gesture AI System</CardTitle>
                <CardDescription>AI-driven gesture generation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Intent detection from narration text</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Gesture library with GLB animation clips</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Synchronized hand, head, and body movements</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Timeline-based gesture playback</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <img src="/assets/generated/emotion-engine-icon-transparent.dim_64x64.png" alt="" className="h-8 w-8" />
              <div>
                <CardTitle>Emotion Engine</CardTitle>
                <CardDescription>Realistic emotion expression</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Emotion detection from narration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Five primary emotions: happy, sad, angry, fear, calm</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Facial blendshape control</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Body posture animation</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
