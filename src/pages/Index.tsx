import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    count: number;
    hash: string;
    safety: "safe" | "moderate" | "weak";
  } | null>(null);

  const sha1 = async (str: string): Promise<string> => {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const checkPassword = async () => {
    if (!password) {
      toast.error("비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const hash = await sha1(password);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const data = await response.text();

      const lines = data.split("\n");
      let count = 0;

      for (const line of lines) {
        const [hashSuffix, countStr] = line.split(":");
        if (hashSuffix.trim() === suffix) {
          count = parseInt(countStr.trim(), 10);
          break;
        }
      }

      let safety: "safe" | "moderate" | "weak";
      if (count === 0) {
        safety = "safe";
      } else if (count < 100) {
        safety = "moderate";
      } else {
        safety = "weak";
      }

      setResult({ count, hash, safety });
    } catch (error) {
      toast.error("검사 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const getSafetyInfo = () => {
    if (!result) return null;

    switch (result.safety) {
      case "safe":
        return {
          label: "안전",
          icon: <CheckCircle2 className="w-5 h-5" />,
          variant: "default" as const,
          color: "text-green-600 dark:text-green-400",
        };
      case "moderate":
        return {
          label: "보통",
          icon: <Shield className="w-5 h-5" />,
          variant: "secondary" as const,
          color: "text-yellow-600 dark:text-yellow-400",
        };
      case "weak":
        return {
          label: "취약",
          icon: <AlertTriangle className="w-5 h-5" />,
          variant: "destructive" as const,
          color: "text-red-600 dark:text-red-400",
        };
    }
  };

  const safetyInfo = getSafetyInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">정보보안의 날 행사</h1>
            <p className="text-lg text-muted-foreground">
              매년 7월 둘째 주 수요일은 정보보안의 날입니다
            </p>
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

      {/* Password Checker Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">비밀번호 유출 검사</h2>
              <p className="text-sm text-muted-foreground">
                내 비밀번호가 안전한지 확인해보세요
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>비밀번호 검사</CardTitle>
                <CardDescription>
                  Have I Been Pwned API를 통해 비밀번호 유출 여부를 확인합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="검사할 비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && checkPassword()}
                  />
                  <Button
                    onClick={checkPassword}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        검사 중...
                      </>
                    ) : (
                      "검사하기"
                    )}
                  </Button>
                </div>

                {result && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">안전도</span>
                      {safetyInfo && (
                        <Badge variant={safetyInfo.variant} className="flex items-center gap-1">
                          {safetyInfo.icon}
                          {safetyInfo.label}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">유출 횟수</span>
                      <span className={`text-sm font-mono ${safetyInfo?.color}`}>
                        {result.count.toLocaleString()}회
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm font-medium">SHA-1 해시</span>
                      <p className="text-xs font-mono break-all bg-muted p-2 rounded">
                        {result.hash}
                      </p>
                    </div>

                    {result.count > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          비밀번호 보안 권장사항
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>즉시 비밀번호를 변경하세요</li>
                          <li>영문 대소문자, 숫자, 특수문자를 조합하세요</li>
                          <li>최소 12자 이상으로 설정하세요</li>
                          <li>다른 사이트와 같은 비밀번호를 사용하지 마세요</li>
                          <li>정기적으로 비밀번호를 변경하세요</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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
