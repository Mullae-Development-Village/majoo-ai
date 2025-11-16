import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  full_name: z.string().min(1, "이름을 입력해주세요"),
  age: z.number().min(1, "나이를 입력해주세요"),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string>("");
  const [assets, setAssets] = useState<Array<{ id?: string; description: string }>>([]);
  const [needs, setNeeds] = useState<Array<{ id?: string; description: string }>>([]);
  const [newAsset, setNewAsset] = useState("");
  const [newNeed, setNewNeed] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      age: 0,
      bio: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        navigate("/onboarding");
        return;
      }

      setProfileId(profile.id);
      form.reset({
        full_name: profile.full_name,
        age: profile.age || 0,
        bio: profile.bio || "",
      });

      // Load assets
      const { data: assetsData } = await supabase
        .from("profile_assets")
        .select("id, description")
        .eq("profile_id", profile.id);

      if (assetsData) {
        setAssets(assetsData);
      }

      // Load needs
      const { data: needsData } = await supabase
        .from("profile_needs")
        .select("id, description")
        .eq("profile_id", profile.id);

      if (needsData) {
        setNeeds(needsData);
      }
    } catch (error: any) {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          age: data.age,
          bio: data.bio,
        })
        .eq("id", profileId);

      if (profileError) throw profileError;

      toast({
        title: "저장 완료",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      });

      navigate("/matching");
    } catch (error: any) {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addAsset = async () => {
    if (!newAsset.trim()) return;

    try {
      const { data, error } = await supabase
        .from("profile_assets")
        .insert({
          profile_id: profileId,
          category_id: "00000000-0000-0000-0000-000000000000", // dummy category
          description: newAsset,
        })
        .select()
        .single();

      if (error) throw error;

      setAssets([...assets, { id: data.id, description: newAsset }]);
      setNewAsset("");

      toast({
        title: "추가 완료",
        description: "나눌 수 있는 것이 추가되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "추가 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeAsset = async (index: number) => {
    const asset = assets[index];
    if (asset.id) {
      try {
        const { error } = await supabase
          .from("profile_assets")
          .delete()
          .eq("id", asset.id);

        if (error) throw error;

        toast({
          title: "삭제 완료",
          description: "나눌 수 있는 것이 삭제되었습니다.",
        });
      } catch (error: any) {
        toast({
          title: "삭제 실패",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    setAssets(assets.filter((_, i) => i !== index));
  };

  const addNeed = async () => {
    if (!newNeed.trim()) return;

    try {
      const { data, error } = await supabase
        .from("profile_needs")
        .insert({
          profile_id: profileId,
          category_id: "00000000-0000-0000-0000-000000000000", // dummy category
          description: newNeed,
        })
        .select()
        .single();

      if (error) throw error;

      setNeeds([...needs, { id: data.id, description: newNeed }]);
      setNewNeed("");

      toast({
        title: "추가 완료",
        description: "배우고 싶은 것이 추가되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "추가 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeNeed = async (index: number) => {
    const need = needs[index];
    if (need.id) {
      try {
        const { error } = await supabase
          .from("profile_needs")
          .delete()
          .eq("id", need.id);

        if (error) throw error;

        toast({
          title: "삭제 완료",
          description: "배우고 싶은 것이 삭제되었습니다.",
        });
      } catch (error: any) {
        toast({
          title: "삭제 실패",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    setNeeds(needs.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in">
            <Button variant="ghost" size="icon" onClick={() => navigate("/matching")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">프로필 수정</h1>
          </div>

          {/* Basic Info */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름</FormLabel>
                        <FormControl>
                          <Input placeholder="이름을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>나이</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="나이를 입력하세요"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>소개 (선택)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="자신을 간단히 소개해주세요"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      "저장하기"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Assets */}
          <Card className="animate-fade-in [animation-delay:100ms]">
            <CardHeader>
              <CardTitle>💡 나눌 수 있는 것</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="예: AI 툴을 활용한 유튜브 섬네일 제작법"
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addAsset()}
                />
                <Button onClick={addAsset} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {assets.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/20"
                  >
                    <span className="text-sm">{asset.description}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAsset(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {assets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    아직 추가된 항목이 없습니다
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Needs */}
          <Card className="animate-fade-in [animation-delay:200ms]">
            <CardHeader>
              <CardTitle>🎯 배우고 싶은 것</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="예: 손주와 소통하기 위해 유튜브 섬네일 만드는 법"
                  value={newNeed}
                  onChange={(e) => setNewNeed(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addNeed()}
                />
                <Button onClick={addNeed} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {needs.map((need, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20"
                  >
                    <span className="text-sm">{need.description}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNeed(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {needs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    아직 추가된 항목이 없습니다
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
