import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, User, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  full_name: string;
  age: number;
  user_type: "youth" | "senior";
  bio: string;
  assets: Array<{ category_name: string; description: string }>;
  needs: Array<{ category_name: string; description: string }>;
};

const Matching = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Profile[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get current user's profile
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

      // Get current user's assets and needs
      const { data: assets } = await supabase
        .from("profile_assets")
        .select(`
          description,
          categories (name)
        `)
        .eq("profile_id", profile.id);

      const { data: needs } = await supabase
        .from("profile_needs")
        .select(`
          description,
          categories (name)
        `)
        .eq("profile_id", profile.id);

      setCurrentProfile({
        ...profile,
        assets: assets?.map((a: any) => ({
          category_name: a.categories?.name || "",
          description: a.description,
        })) || [],
        needs: needs?.map((n: any) => ({
          category_name: n.categories?.name || "",
          description: n.description,
        })) || [],
      });

      // Get all other profiles (opposite user type for better matching)
      const oppositeType = profile.user_type === "youth" ? "senior" : "youth";
      const { data: otherProfiles, error: matchError } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", session.user.id)
        .eq("user_type", oppositeType);

      if (matchError) throw matchError;

      // Load assets and needs for each profile
      const profilesWithData = await Promise.all(
        (otherProfiles || []).map(async (p) => {
          const { data: pAssets } = await supabase
            .from("profile_assets")
            .select(`
              description,
              categories (name)
            `)
            .eq("profile_id", p.id);

          const { data: pNeeds } = await supabase
            .from("profile_needs")
            .select(`
              description,
              categories (name)
            `)
            .eq("profile_id", p.id);

          return {
            ...p,
            assets: pAssets?.map((a: any) => ({
              category_name: a.categories?.name || "",
              description: a.description,
            })) || [],
            needs: pNeeds?.map((n: any) => ({
              category_name: n.categories?.name || "",
              description: n.description,
            })) || [],
          };
        })
      );

      setMatches(profilesWithData);
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

  const calculateMatchScore = (profile: Profile) => {
    if (!currentProfile) return 0;
    
    // Simple matching: count overlapping categories
    let score = 0;
    const maxScore = currentProfile.needs.length + currentProfile.assets.length;
    
    // Check if their assets match our needs
    profile.assets.forEach((asset) => {
      if (currentProfile.needs.some((need) => need.category_name === asset.category_name)) {
        score++;
      }
    });
    
    // Check if their needs match our assets
    profile.needs.forEach((need) => {
      if (currentProfile.assets.some((asset) => asset.category_name === need.category_name)) {
        score++;
      }
    });
    
    return Math.round((score / (maxScore || 1)) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedMatches = matches
    .map((m) => ({ ...m, matchScore: calculateMatchScore(m) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {currentProfile?.user_type === "youth" ? "시니어 파트너들" : "청년 파트너들"}
              </h1>
              <p className="text-muted-foreground mt-1">
                매칭도가 높을수록 서로의 니즈가 잘 맞아떨어집니다
              </p>
            </div>
          </div>

          {/* Current Profile Info */}
          <Card className="border-2 border-primary/20 bg-primary/5 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">
                  {currentProfile?.user_type === "youth" ? "📚" : "🎁"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    {currentProfile?.full_name}님의 프로필
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-secondary mb-1">🎁 나눌 수 있는 것</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {currentProfile?.assets.slice(0, 3).map((asset, i) => (
                          <li key={i}>• {asset.category_name}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-accent-foreground mb-1">📚 배우고 싶은 것</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {currentProfile?.needs.slice(0, 3).map((need, i) => (
                          <li key={i}>• {need.category_name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matches List */}
          {sortedMatches.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="p-12 text-center">
                <p className="text-xl text-muted-foreground">
                  아직 매칭 가능한 파트너가 없습니다.
                  <br />
                  조금만 기다려주세요!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 animate-fade-in">
              {sortedMatches.map((match, index) => (
                <Card 
                  key={match.id} 
                  className="border-2 hover:shadow-soft transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center shadow-soft">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{match.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {match.age}세 • {match.user_type === "youth" ? "청년" : "시니어"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-sm font-bold">
                        매칭도 {match.matchScore}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {match.bio && (
                      <p className="text-sm text-muted-foreground border-l-4 border-primary pl-4">
                        {match.bio}
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                        <p className="text-xs font-medium text-secondary mb-2">🎁 나눌 수 있는 것</p>
                        <div className="space-y-1">
                          {match.assets.slice(0, 3).map((asset, i) => (
                            <div key={i}>
                              <p className="font-medium text-sm">{asset.category_name}</p>
                              {asset.description && (
                                <p className="text-xs text-muted-foreground">{asset.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-xs font-medium text-accent-foreground mb-2">📚 배우고 싶은 것</p>
                        <div className="space-y-1">
                          {match.needs.slice(0, 3).map((need, i) => (
                            <div key={i}>
                              <p className="font-medium text-sm">{need.category_name}</p>
                              {need.description && (
                                <p className="text-xs text-muted-foreground">{need.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button className="flex-1 group-hover:shadow-md transition-all">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        대화 시작하기
                      </Button>
                      <Button variant="outline" className="flex-1">
                        프로필 보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matching;
