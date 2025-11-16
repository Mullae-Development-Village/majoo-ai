import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              세대를 잇는 새로운 배움
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            나이는 숫자일 뿐,
            <br />
            <span className="bg-gradient-warm bg-clip-text text-transparent">
              서로에게 배우고 나눕니다
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            시니어의 경험과 청년의 지식이 만나는 곳.
            일방적인 교육이 아닌, 진정한 상호 교류를 시작하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/profiles">
              <Button size="lg" className="text-lg px-8 py-6 shadow-soft hover:shadow-lg transition-all">
                시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              더 알아보기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:shadow-soft transition-all duration-300 animate-fade-in">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-warm rounded-2xl flex items-center justify-center shadow-soft">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">양방향 교류</h3>
              <p className="text-muted-foreground">
                누구나 '배우는 사람'이자 '나누는 사람'이 될 수 있습니다
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-soft transition-all duration-300 animate-fade-in [animation-delay:100ms]">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-secondary rounded-2xl flex items-center justify-center shadow-soft">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">AI 스마트 매칭</h3>
              <p className="text-muted-foreground">
                당신의 배움과 나눔을 최적의 파트너와 연결합니다
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-soft transition-all duration-300 animate-fade-in [animation-delay:200ms]">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center shadow-soft">
                <Heart className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold">세대 간 연결</h3>
              <p className="text-muted-foreground">
                경험과 혁신이 만나 진짜 경험을 만들어갑니다
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="max-w-3xl mx-auto bg-gradient-warm border-0 shadow-soft">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              지금 시작해보세요
            </h2>
            <p className="text-lg text-white/90">
              당신이 배우고 싶은 것, 나눌 수 있는 것을 공유하고
              <br />
              완벽한 교환 파트너를 만나보세요
            </p>
            <Link to="/profiles">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 mt-4">
                프로필 만들기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <p className="text-center text-muted-foreground">
          © 2024 세대 교류 플랫폼. 모두에게 열린 배움의 공간.
        </p>
      </footer>
    </div>
  );
};

export default Index;
