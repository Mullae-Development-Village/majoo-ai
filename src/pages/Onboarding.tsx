import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

type UserType = "youth" | "senior";
type Category = {
  id: string;
  name: string;
  type: string;
};

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
  
  // Step 3: Assets & Needs
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [selectedNeeds, setSelectedNeeds] = useState<Set<string>>(new Set());
  const [assetDescriptions, setAssetDescriptions] = useState<Record<string, string>>({});
  const [needDescriptions, setNeedDescriptions] = useState<Record<string, string>>({});

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

    // Load categories
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
        
      if (!error && data) {
        setCategories(data);
      }
    };
    
    loadCategories();
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

  const handleComplete = async () => {
    if (selectedAssets.size === 0 || selectedNeeds.size === 0) {
      toast({
        title: "최소 1개 이상 선택해주세요",
        description: "나눌 수 있는 것과 배우고 싶은 것을 각각 선택해주세요.",
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

      // Insert assets
      for (const categoryId of Array.from(selectedAssets)) {
        await supabase.from("profile_assets").insert({
          profile_id: profile.id,
          category_id: categoryId,
          description: assetDescriptions[categoryId] || "",
        });
      }

      // Insert needs
      for (const categoryId of Array.from(selectedNeeds)) {
        await supabase.from("profile_needs").insert({
          profile_id: profile.id,
          category_id: categoryId,
          description: needDescriptions[categoryId] || "",
        });
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

  const toggleAsset = (categoryId: string) => {
    const newSet = new Set(selectedAssets);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedAssets(newSet);
  };

  const toggleNeed = (categoryId: string) => {
    const newSet = new Set(selectedNeeds);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedNeeds(newSet);
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
                    <div className="text-5xl">😮</div>
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
                    <div className="text-5xl">👨</div>
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
                <CardTitle className="text-2xl">👨 내가 나눌 수 있는 것</CardTitle>
                <p className="text-muted-foreground">
                  자신있거나 남에게 나눠줄 수 있는 것을 선택하세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`asset-${category.id}`}
                        checked={selectedAssets.has(category.id)}
                        onCheckedChange={() => toggleAsset(category.id)}
                      />
                      <Label
                        htmlFor={`asset-${category.id}`}
                        className="cursor-pointer font-medium"
                      >
                        {category.name}
                      </Label>
                    </div>
                    {selectedAssets.has(category.id) && (
                      <Input
                        placeholder="상세 설명 (예: 50년 노하우의 김치 담그는 비법)"
                        value={assetDescriptions[category.id] || ""}
                        onChange={(e) =>
                          setAssetDescriptions({
                            ...assetDescriptions,
                            [category.id]: e.target.value,
                          })
                        }
                        className="ml-9"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">😮 내가 배우고 싶은 것</CardTitle>
                <p className="text-muted-foreground">
                  도움이 필요하거나 배우고 싶은 것을 선택하세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`need-${category.id}`}
                        checked={selectedNeeds.has(category.id)}
                        onCheckedChange={() => toggleNeed(category.id)}
                      />
                      <Label
                        htmlFor={`need-${category.id}`}
                        className="cursor-pointer font-medium"
                      >
                        {category.name}
                      </Label>
                    </div>
                    {selectedNeeds.has(category.id) && (
                      <Input
                        placeholder="상세 설명 (예: 유튜브 섬네일 만드는 법)"
                        value={needDescriptions[category.id] || ""}
                        onChange={(e) =>
                          setNeedDescriptions({
                            ...needDescriptions,
                            [category.id]: e.target.value,
                          })
                        }
                        className="ml-9"
                      />
                    )}
                  </div>
                ))}
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
