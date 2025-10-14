import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Shield, ArrowRight, ArrowLeft } from "lucide-react";

const Survey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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
      setStep(3);
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
      <section className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">비밀번호 유출 검사</h1>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                홈으로
              </Button>
            </div>
            <p className="text-muted-foreground">
              단계별로 비밀번호 보안을 확인해보세요
            </p>
            <div className="flex items-center gap-2 mt-6">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Introduction */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>정보보안의 중요성</CardTitle>
                  <CardDescription>
                    매년 수백만 개의 비밀번호가 유출됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">비밀번호 유출이란?</h3>
                    <p className="text-sm text-muted-foreground">
                      해커들이 데이터 유출 사고를 통해 수집한 비밀번호 목록이 인터넷에 공개되는 것을 말합니다. 
                      이러한 비밀번호는 다른 공격에 재사용될 수 있어 매우 위험합니다.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Have I Been Pwned란?</h3>
                    <p className="text-sm text-muted-foreground">
                      전 세계적으로 유출된 비밀번호 데이터베이스를 관리하는 서비스입니다. 
                      여러분의 비밀번호가 과거 유출 사고에 포함되었는지 안전하게 확인할 수 있습니다.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">🔒 개인정보 보호</p>
                    <p className="text-sm text-muted-foreground">
                      검사 시 비밀번호는 SHA-1 해시로 암호화되며, 
                      해시의 일부만 전송되어 완전한 비밀번호는 절대 노출되지 않습니다.
                    </p>
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full gap-2">
                    다음 단계
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Password Check */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>비밀번호 검사</CardTitle>
                  <CardDescription>
                    검사할 비밀번호를 입력해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkPassword()}
                      className="text-lg"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      이전
                    </Button>
                    <Button
                      onClick={checkPassword}
                      disabled={loading}
                      className="flex-1 gap-2"
                    >
                      {loading ? "검사 중..." : "검사하기"}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Results */}
            {step === 3 && result && (
              <Card>
                <CardHeader>
                  <CardTitle>검사 결과</CardTitle>
                  <CardDescription>
                    비밀번호 보안 분석이 완료되었습니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="font-medium">안전도</span>
                      {safetyInfo && (
                        <Badge variant={safetyInfo.variant} className="flex items-center gap-2">
                          {safetyInfo.icon}
                          {safetyInfo.label}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="font-medium">유출 횟수</span>
                      <span className={`text-lg font-mono font-bold ${safetyInfo?.color}`}>
                        {result.count.toLocaleString()}회
                      </span>
                    </div>

                    <div className="space-y-2 p-4 bg-muted rounded-lg">
                      <span className="font-medium">SHA-1 해시</span>
                      <p className="text-xs font-mono break-all opacity-70">
                        {result.hash}
                      </p>
                    </div>
                  </div>

                  {result.count > 0 ? (
                    <div className="p-4 border-2 border-destructive rounded-lg space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        비밀번호를 즉시 변경하세요!
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>영문 대소문자, 숫자, 특수문자를 조합하세요</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>최소 12자 이상으로 설정하세요</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>다른 사이트와 같은 비밀번호를 사용하지 마세요</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>정기적으로 비밀번호를 변경하세요</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>2단계 인증(OTP)을 활성화하세요</span>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-primary rounded-lg space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                        안전한 비밀번호입니다!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        현재까지 알려진 유출 사고에서 발견되지 않은 비밀번호입니다. 
                        하지만 지속적인 보안 관리를 위해 정기적으로 비밀번호를 변경하고 
                        2단계 인증을 사용하시는 것을 권장합니다.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(2);
                        setPassword("");
                        setResult(null);
                      }}
                      className="flex-1"
                    >
                      다시 검사하기
                    </Button>
                    <Button
                      onClick={() => navigate("/")}
                      className="flex-1"
                    >
                      완료
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">19대 학생회 AI부 X 기획부</p>
        </div>
      </footer>
    </div>
  );
};

export default Survey;
