import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">정보보안의 날 행사</h1>
            <p className="text-lg text-muted-foreground">
              매년 7월 둘째 주 수요일은 정보보안의 날입니다
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/survey")}
              className="gap-2"
            >
              <ClipboardList className="w-5 h-5" />
              정보보안 인식 조사 참여하기
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">정보보안의 날이란?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">목적</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    정보보호의 중요성에 대한 국민 인식을 제고하고, 
                    정보보호 문화를 확산하기 위해 제정되었습니다.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">역사</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    2012년부터 시작되어 매년 다양한 캠페인과 행사를 통해 
                    정보보안의 중요성을 알리고 있습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>


      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">19대 학생회 AI부 X 기획부</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
