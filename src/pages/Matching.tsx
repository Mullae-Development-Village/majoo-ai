import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

// Mock data for demonstration
const mockMatches = {
  learn: [
    {
      id: 1,
      name: "김영희",
      age: 62,
      canShare: "50년 노하우 김치 담그는 비법",
      wantLearn: "유튜브 영상 편집 기초",
      category: "요리",
      matchScore: 95,
    },
    {
      id: 2,
      name: "이철수",
      age: 58,
      canShare: "목공예 기술과 DIY 가구 제작",
      wantLearn: "스마트폰 활용법",
      category: "전문 기술",
      matchScore: 88,
    },
    {
      id: 3,
      name: "박순자",
      age: 67,
      canShare: "전통 한복 재단과 바느질",
      wantLearn: "인스타그램 사용법",
      category: "전문 기술",
      matchScore: 82,
    },
  ],
  share: [
    {
      id: 4,
      name: "최민준",
      age: 28,
      canShare: "AI 툴을 활용한 디자인",
      wantLearn: "인생 상담과 조언",
      category: "디지털",
      matchScore: 92,
    },
    {
      id: 5,
      name: "정서연",
      age: 25,
      canShare: "소셜미디어 마케팅 전략",
      wantLearn: "재테크와 자산 관리",
      category: "디지털",
      matchScore: 87,
    },
    {
      id: 6,
      name: "강태현",
      age: 32,
      canShare: "프로그래밍 기초 교육",
      wantLearn: "요리와 식단 관리",
      category: "개발",
      matchScore: 79,
    },
  ],
};

const Matching = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "learn";
  const isLearnMode = type === "learn";
  const matches = isLearnMode ? mockMatches.learn : mockMatches.share;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in">
            <Link to="/profiles">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {isLearnMode ? "배울 수 있는 파트너들 😮" : "나눔을 원하는 파트너들 👨"}
              </h1>
              <p className="text-muted-foreground mt-1">
                AI가 매칭한 최적의 교환 파트너를 확인하세요
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <Card className="border-2 border-primary/20 bg-primary/5 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{isLearnMode ? "🎓" : "🤝"}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    {isLearnMode ? "이 분들이 당신에게 가르쳐줄 수 있어요" : "이 분들이 당신의 지식을 필요로 해요"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    매칭 점수가 높을수록 서로의 니즈가 잘 맞아떨어집니다. 
                    대화를 시작하고 상호 교류의 첫걸음을 내딛어보세요!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matches List */}
          <div className="grid gap-6 animate-fade-in">
            {matches.map((match, index) => (
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
                        <h3 className="text-xl font-bold">{match.name}</h3>
                        <p className="text-sm text-muted-foreground">{match.age}세</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm font-bold">
                      매칭도 {match.matchScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                      <p className="text-xs font-medium text-secondary mb-2">👨 나눌 수 있는 것</p>
                      <p className="font-medium">{match.canShare}</p>
                      <Badge variant="outline" className="mt-2">{match.category}</Badge>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-xs font-medium text-accent-foreground mb-2">😮 배우고 싶은 것</p>
                      <p className="font-medium">{match.wantLearn}</p>
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

          {/* Toggle Button */}
          <div className="text-center pt-8">
            <Link to={`/matching?type=${isLearnMode ? 'share' : 'learn'}`}>
              <Button variant="outline" size="lg">
                {isLearnMode ? "나눌 수 있는 분들 보기 →" : "← 배울 수 있는 분들 보기"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matching;
