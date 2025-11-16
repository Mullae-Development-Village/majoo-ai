import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Profiles = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">
              어떤 프로필로 시작하시겠어요?
            </h1>
            <p className="text-xl text-muted-foreground">
              모든 사용자는 두 가지 역할을 동시에 가집니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 배울래요 Card */}
            <Card className="border-2 hover:shadow-soft transition-all duration-300 group cursor-pointer animate-fade-in">
              <Link to="/matching?type=learn">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎯</div>
                    <h2 className="text-2xl font-bold">배울래요</h2>
                    <p className="text-muted-foreground">
                      내가 현재 배우고 싶은 것
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">💡 예시</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• "손주와 소통하기 위해 유튜브 섬네일 만드는 법"</li>
                        <li>• "깊은 맛이 나는 것에 담그는 법"</li>
                        <li>• "면접관의 입장에서 이력서를 어떻게 보는지"</li>
                      </ul>
                    </div>
                  </div>

                  <Button className="w-full group-hover:shadow-md transition-all" size="lg">
                    배울 내용 등록하기
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* 나눌게요 Card */}
            <Card className="border-2 hover:shadow-soft transition-all duration-300 group cursor-pointer animate-fade-in [animation-delay:100ms]">
              <Link to="/matching?type=share">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">💡</div>
                    <h2 className="text-2xl font-bold">나눌게요</h2>
                    <p className="text-muted-foreground">
                      내가 자신 있거나 남에게 나눌 수 있는 것
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">💡 예시</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• "50년 노하우가 담긴 절대 찢어지지 않는 비법"</li>
                        <li>• "대기업 입찰 출신 1000장 넘게 본 이력서 피드백"</li>
                        <li>• "AI 툴을 활용한 감각적인 유튜브 섬네일 제작법"</li>
                      </ul>
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full group-hover:shadow-md transition-all" size="lg">
                    나눌 내용 등록하기
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="text-center space-y-4 pt-8">
            <div className="p-6 bg-accent/10 rounded-2xl border-2 border-accent/20">
              <p className="text-lg font-medium text-accent-foreground">
                💡 <strong>핵심:</strong> AI가 시니어A와 청년B를 '상호 교환 파트너'로 매칭합니다
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                서로의 "배울래요"와 "나눌게요"가 연결되어 진정한 상호 교류가 시작됩니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;
