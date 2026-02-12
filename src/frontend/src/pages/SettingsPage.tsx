import { User, Bell, Shield, CreditCard, Sparkles, Clapperboard, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import AvatarSetup from '../components/AvatarSetup';
import { useState, useEffect } from 'react';
import {
  getEmotionAnalysisProvider,
  setEmotionAnalysisProvider,
  EMOTION_PROVIDERS,
  type EmotionProvider,
} from '../utils/emotionProvider';
import {
  getGenerationProvider,
  setGenerationProvider,
  GENERATION_PROVIDERS,
  type GenerationProvider,
} from '../utils/generationProvider';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const [emotionProvider, setEmotionProviderState] = useState<EmotionProvider>('local');
  const [generationProvider, setGenerationProviderState] = useState<GenerationProvider>('kling26');

  useEffect(() => {
    const savedEmotionProvider = getEmotionAnalysisProvider();
    setEmotionProviderState(savedEmotionProvider);
    
    const savedGenerationProvider = getGenerationProvider();
    setGenerationProviderState(savedGenerationProvider);
  }, []);

  const handleEmotionProviderChange = (value: string) => {
    const provider = value as EmotionProvider;
    setEmotionProviderState(provider);
    setEmotionAnalysisProvider(provider);
    
    if (provider === 'gemini') {
      toast.info('Google Gemini integration coming soon! Using local analysis for now.');
    } else {
      toast.success('Emotion analysis provider updated');
    }
  };

  const handleGenerationProviderChange = (value: string) => {
    const provider = value as GenerationProvider;
    setGenerationProviderState(provider);
    setGenerationProvider(provider);
    
    const providerInfo = GENERATION_PROVIDERS[provider];
    
    if (!providerInfo.available) {
      toast.info(`${providerInfo.name} integration coming soon! Using local generation for now.`, {
        duration: 4000,
      });
    } else {
      toast.success('Generation provider updated');
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-amber-400">Settings</h1>
          <p className="text-lg text-neutral-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-400">Profile</CardTitle>
                    <CardDescription className="text-neutral-400">Manage your profile information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-10 w-full bg-neutral-700" />
                    <Skeleton className="h-10 w-full bg-neutral-700" />
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-neutral-300">Name</Label>
                      <Input id="name" defaultValue={profile?.name || ''} className="border-neutral-600 bg-neutral-900/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-neutral-300">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" className="border-neutral-600 bg-neutral-900/50" />
                    </div>
                    <Button className="bg-amber-500 hover:bg-amber-600">Save Changes</Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Generation Provider */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <Clapperboard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-400">Generation Provider</CardTitle>
                    <CardDescription className="text-neutral-400">Choose your video generation engine</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={generationProvider} onValueChange={handleGenerationProviderChange}>
                  {Object.values(GENERATION_PROVIDERS).map((provider) => (
                    <div key={provider.id} className="flex items-start space-x-3 space-y-0 rounded-lg border border-neutral-700 p-4 hover:bg-neutral-700/30">
                      <RadioGroupItem
                        value={provider.id}
                        id={`gen-${provider.id}`}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`gen-${provider.id}`}
                          className="flex items-center gap-2 cursor-pointer text-neutral-200"
                        >
                          {provider.name}
                          {provider.badge && (
                            <Badge className="text-xs bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {provider.badge}
                            </Badge>
                          )}
                          {!provider.available && (
                            <span className="text-xs font-normal text-amber-500">
                              (Coming soon)
                            </span>
                          )}
                        </Label>
                        <p className="text-sm text-neutral-400 mt-1">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Emotion Analysis Provider */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-400">Emotion Analysis Provider</CardTitle>
                    <CardDescription className="text-neutral-400">Choose how emotions are detected in your videos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={emotionProvider} onValueChange={handleEmotionProviderChange}>
                  {Object.values(EMOTION_PROVIDERS).map((provider) => (
                    <div key={provider.id} className="flex items-start space-x-3 space-y-0 rounded-lg border border-neutral-700 p-4 hover:bg-neutral-700/30">
                      <RadioGroupItem
                        value={provider.id}
                        id={provider.id}
                        disabled={!provider.available}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={provider.id}
                          className={`flex items-center gap-2 ${
                            !provider.available ? 'text-neutral-500' : 'cursor-pointer text-neutral-200'
                          }`}
                        >
                          {provider.name}
                          {!provider.available && (
                            <span className="text-xs font-normal text-amber-500">
                              (Coming soon)
                            </span>
                          )}
                        </Label>
                        <p className="text-sm text-neutral-400 mt-1">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-400">Notifications</CardTitle>
                    <CardDescription className="text-neutral-400">Manage your notification preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-neutral-300">Email Notifications</Label>
                    <p className="text-sm text-neutral-400">Receive updates about your videos</p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-neutral-700" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-neutral-300">Generation Complete</Label>
                    <p className="text-sm text-neutral-400">Get notified when videos finish</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-400">Security</CardTitle>
                    <CardDescription className="text-neutral-400">Manage your security settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                  Enable Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card className="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-400">Billing</CardTitle>
                    <CardDescription className="text-neutral-400">Manage your subscription and billing</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-200">Free Plan</p>
                      <p className="text-sm text-neutral-400">$0/month</p>
                    </div>
                    <Button className="bg-amber-500 hover:bg-amber-600">Upgrade</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avatar Setup Sidebar */}
          <div className="lg:col-span-1">
            <AvatarSetup />
          </div>
        </div>
      </div>
    </div>
  );
}
