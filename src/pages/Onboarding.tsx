import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Plus, X } from "lucide-react";

type UserType = "youth" | "senior";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  
  // Step 1: User type selection
  const [userType, setUserType] = useState<UserType | null>(null);
  
  // Step 2: Basic info
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  
  // Step 3: Assets & Needs - new approach with free text input
  const [assets, setAssets] = useState<Array<{ id: string; description: string }>>([]);
  const [needs, setNeeds] = useState<Array<{ id: string; description: string }>>([]);
  const [currentAssetInput, setCurrentAssetInput] = useState("");
  const [currentNeedInput, setCurrentNeedInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setFullName(session.user.user_metadata.full_name || "");
      
      // Check if profile already exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
        
      if (profile) {
        navigate("/matching");
      }
    });
  }, [navigate]);

  const handleNext = () => {
    if (step === 1 && !userType) {
      toast({
        title: "프로필 유형을 선택해주세요",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && (!fullName || !age)) {
      toast({
        title: "필수 정보를 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    
    setStep(step + 1);
  };

  const addAsset = () => {
    if (!currentAssetInput.trim()) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const newAsset = {
      id: Date.now().toString(),
      description: currentAssetInput.trim(),
    };

    setAssets([...assets, newAsset]);
    setCurrentAssetInput("");
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter((asset) => asset.id !== id));
  };

  const addNeed = () => {
    if (!currentNeedInput.trim()) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const newNeed = {
      id: Date.now().toString(),
      description: currentNeedInput.trim(),
    };

    setNeeds([...needs, newNeed]);
    setCurrentNeedInput("");
  };

  const removeNeed = (id: string) => {
    setNeeds(needs.filter((need) => need.id !== id));
  };

  const handleComplete = async () => {
    if (assets.length === 0 || needs.length === 0) {
      toast({
        title: "최소 1개 이상 추가해주세요",
        description: "나눌 수 있는 것과 배우고 싶은 것을 각각 추가해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          user_type: userType,
          full_name: fullName,
          age: parseInt(age),
          bio,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // For assets and needs, we'll create a generic category or store as text
      // Since we're moving away from predefined categories, let's create them dynamically
      for (const asset of assets) {
        // Find or create category
        const { data: existingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("name", asset.description)
          .maybeSingle();

        let categoryId;
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory } = await supabase
            .from("categories")
            .insert({ name: asset.description, type: "custom" })
            .select("id")
            .single();
          categoryId = newCategory?.id;
        }

        if (categoryId) {
          await supabase.from("profile_assets").insert({
            profile_id: profile.id,
            category_id: categoryId,
            description: asset.description,
          });
        }
      }

      for (const need of needs) {
        // Find or create category
        const { data: existingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("name", need.description)
          .maybeSingle();

        let categoryId;
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory } = await supabase
            .from("categories")
            .insert({ name: need.description, type: "custom" })
            .select("id")
            .single();
          categoryId = newCategory?.id;
        }

        if (categoryId) {
          await supabase.from("profile_needs").insert({
            profile_id: profile.id,
            category_id: categoryId,
            description: need.description,
          });
        }
      }

      toast({
        title: "프로필 생성 완료!",
        description: "이제 매칭 파트너를 찾아보세요.",
      });

      navigate("/matching");
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

  return (
    <div className="min-h-screen bg-gradient-hero p-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-12 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: User Type Selection */}
        {step === 1 && (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">어떤 프로필을 만드시겠어요?</CardTitle>
              <p className="text-muted-foreground">
                나이와 관계없이 본인에게 맞는 프로필을 선택하세요
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all border-2 ${
                    userType === "youth" ? "border-primary shadow-soft" : "border-border"
                  }`}
                  onClick={() => setUserType("youth")}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="text-5xl">🧑</div>
                    <h3 className="text-xl font-bold">청년 프로필 가입</h3>
                    <p className="text-sm text-muted-foreground">
                      청년 프로필로 시작합니다
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all border-2 ${
                    userType === "senior" ? "border-primary shadow-soft" : "border-border"
                  }`}
                  onClick={() => setUserType("senior")}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="text-5xl">👴</div>
                    <h3 className="text-xl font-bold">시니어 프로필 가입</h3>
                    <p className="text-sm text-muted-foreground">
                      시니어 프로필로 시작합니다
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={handleNext} className="w-full" size="lg">
                다음
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">기본 정보를 입력해주세요</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">이름 *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="홍길동"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">나이 *</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">자기소개 (선택)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="간단한 자기소개를 작성해주세요"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  이전
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  다음
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Assets & Needs */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="text-3xl">💡</span>
                  내가 나눌 수 있는 것
                </CardTitle>
                <p className="text-muted-foreground">
                  자신있거나 남에게 나눠줄 수 있는 것을 추가하세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="예: 50년 노하우의 김치 담그는 비법"
                    value={currentAssetInput}
                    onChange={(e) => setCurrentAssetInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAsset();
                      }
                    }}
                  />
                  <Button onClick={addAsset} type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {assets.length > 0 && (
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/20"
                      >
                        <p className="text-sm flex-1">{asset.description}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAsset(asset.id)}
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="text-3xl">🎯</span>
                  내가 배우고 싶은 것
                </CardTitle>
                <p className="text-muted-foreground">
                  도움이 필요하거나 배우고 싶은 것을 추가하세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="예: 유튜브 섬네일 만드는 법"
                    value={currentNeedInput}
                    onChange={(e) => setCurrentNeedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNeed();
                      }
                    }}
                  />
                  <Button onClick={addNeed} type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {needs.length > 0 && (
                  <div className="space-y-2">
                    {needs.map((need) => (
                      <div
                        key={need.id}
                        className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20"
                      >
                        <p className="text-sm flex-1">{need.description}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNeed(need.id)}
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                이전
              </Button>
              <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                완료
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
