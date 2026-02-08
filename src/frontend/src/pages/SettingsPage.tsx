import { User, Bell, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import AvatarSetup from '../components/AvatarSetup';

export default function SettingsPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold">Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your profile information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue={profile?.name || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                    <Button>Save Changes</Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <Bell className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure your notification preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Video Generation Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your videos are ready
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when approaching plan limits
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your security settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Internet Identity</Label>
                  <p className="text-sm text-muted-foreground">
                    Your account is secured with Internet Identity authentication
                  </p>
                </div>
                <Button variant="outline">Manage Identity</Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <CreditCard className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Free Plan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Videos this month</span>
                    <span className="font-medium">0 / 5</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: '0%' }} />
                  </div>
                </div>
                <Button className="w-full">Upgrade Plan</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar Management</CardTitle>
                <CardDescription>Manage your virtual actors</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarSetup />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
