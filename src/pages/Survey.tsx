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
    length: { score: number; status: "safe" | "moderate" | "weak" };
    complexity: { score: number; status: "safe" | "moderate" | "weak" };
    predictability: { score: number; status: "safe" | "moderate" | "weak" };
    overallScore: number;
  } | null>(null);

  const sha1 = async (str: string): Promise<string> => {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const checkPasswordLength = (pwd: string) => {
    const length = pwd.length;
    let score = 0;
    let status: "safe" | "moderate" | "weak";

    if (length >= 16) {
      score = 100;
      status = "safe";
    } else if (length >= 12) {
      score = 75;
      status = "safe";
    } else if (length >= 8) {
      score = 50;
      status = "moderate";
    } else {
      score = 25;
      status = "weak";
    }

    return { score, status };
  };

  const checkPasswordComplexity = (pwd: string) => {
    let score = 0;
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    if (hasLowerCase) score += 25;
    if (hasUpperCase) score += 25;
    if (hasNumbers) score += 25;
    if (hasSpecialChars) score += 25;

    let status: "safe" | "moderate" | "weak";
    if (score >= 75) {
      status = "safe";
    } else if (score >= 50) {
      status = "moderate";
    } else {
      status = "weak";
    }

    return { score, status };
  };

  const checkPasswordPredictability = (pwd: string) => {
    let score = 100;
    
    // 연속된 문자 체크 (예: abc, 123)
    const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(pwd);
    if (hasSequential) score -= 20;

    // 반복 패턴 체크 (예: aaa, 111)
    const hasRepeating = /(.)\1{2,}/.test(pwd);
    if (hasRepeating) score -= 20;

    // 일반적인 패턴 체크
    const commonPatterns = [
      /password/i, /admin/i, /user/i, /login/i, /welcome/i,
      /qwerty/i, /asdfgh/i, /zxcvbn/i, /111111/, /123456/,
      /abcdef/i, /letmein/i, /monkey/i, /dragon/i
    ];
    
    for (const pattern of commonPatterns) {
      if (pattern.test(pwd)) {
        score -= 30;
        break;
      }
    }

    // 키보드 패턴 체크
    const keyboardPatterns = /qwert|asdfg|zxcvb|poiuy|lkjhg|mnbvc/i;
    if (keyboardPatterns.test(pwd)) score -= 20;

    score = Math.max(0, score);

    let status: "safe" | "moderate" | "weak";
    if (score >= 70) {
      status = "safe";
    } else if (score >= 40) {
      status = "moderate";
    } else {
      status = "weak";
    }

    return { score, status };
  };

  const checkPassword = async () => {
    if (!password) {
      toast.error("비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 길이 검사
      const length = checkPasswordLength(password);
      
      // 복잡성 검사
      const complexity = checkPasswordComplexity(password);
      
      // 예측 불가능성 검사
      const predictability = checkPasswordPredictability(password);

      // Have I Been Pwned API 검사
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

      // 종합 안전도 계산
      let breachScore = 100;
      if (count > 0) {
        if (count >= 100) {
          breachScore = 0;
        } else if (count >= 10) {
          breachScore = 25;
        } else {
          breachScore = 50;
        }
      }

      const overallScore = Math.round(
        (length.score * 0.25 + complexity.score * 0.25 + predictability.score * 0.25 + breachScore * 0.25)
      );

      let safety: "safe" | "moderate" | "weak";
      if (overallScore >= 70) {
        safety = "safe";
      } else if (overallScore >= 40) {
        safety = "moderate";
      } else {
        safety = "weak";
      }

      setResult({ 
        count, 
        hash, 
        safety,
        length,
        complexity,
        predictability,
        overallScore
      });
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
                  {/* 종합 안전도 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="font-medium">종합 안전도</span>
                      {safetyInfo && (
                        <Badge variant={safetyInfo.variant} className="flex items-center gap-2">
                          {safetyInfo.icon}
                          {safetyInfo.label} ({result.overallScore}점)
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 세부 평가 항목 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">세부 평가</h4>
                    
                    {/* 길이 */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">길이</span>
                        <span className="text-xs text-muted-foreground">({password.length}자)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          result.length.status === "safe" ? "text-green-600 dark:text-green-400" :
                          result.length.status === "moderate" ? "text-yellow-600 dark:text-yellow-400" :
                          "text-red-600 dark:text-red-400"
                        }`}>
                          {result.length.score}점
                        </span>
                        {result.length.status === "safe" ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                         result.length.status === "moderate" ? <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> :
                         <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                      </div>
                    </div>

                    {/* 복잡성 */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">복잡성</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          result.complexity.status === "safe" ? "text-green-600 dark:text-green-400" :
                          result.complexity.status === "moderate" ? "text-yellow-600 dark:text-yellow-400" :
                          "text-red-600 dark:text-red-400"
                        }`}>
                          {result.complexity.score}점
                        </span>
                        {result.complexity.status === "safe" ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                         result.complexity.status === "moderate" ? <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> :
                         <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                      </div>
                    </div>

                    {/* 예측 불가능성 */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">예측 불가능성</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          result.predictability.status === "safe" ? "text-green-600 dark:text-green-400" :
                          result.predictability.status === "moderate" ? "text-yellow-600 dark:text-yellow-400" :
                          "text-red-600 dark:text-red-400"
                        }`}>
                          {result.predictability.score}점
                        </span>
                        {result.predictability.status === "safe" ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                         result.predictability.status === "moderate" ? <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> :
                         <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                      </div>
                    </div>

                    {/* 유출 검사 */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">유출 검사</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          result.count === 0 ? "text-green-600 dark:text-green-400" :
                          result.count < 100 ? "text-yellow-600 dark:text-yellow-400" :
                          "text-red-600 dark:text-red-400"
                        }`}>
                          {result.count.toLocaleString()}회
                        </span>
                        {result.count === 0 ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                         result.count < 100 ? <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> :
                         <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <span className="font-medium text-sm">SHA-1 해시</span>
                    <p className="text-xs font-mono break-all opacity-70">
                      {result.hash}
                    </p>
                  </div>

                  {result.overallScore < 70 ? (
                    <div className="p-4 border-2 border-destructive rounded-lg space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        비밀번호 개선이 필요합니다!
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {result.length.status !== "safe" && (
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-0.5">•</span>
                            <span>비밀번호는 최소 12자 이상으로 설정하세요 (현재: {password.length}자)</span>
                          </li>
                        )}
                        {result.complexity.status !== "safe" && (
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-0.5">•</span>
                            <span>영문 대소문자, 숫자, 특수문자를 모두 조합하세요</span>
                          </li>
                        )}
                        {result.predictability.status !== "safe" && (
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-0.5">•</span>
                            <span>연속된 문자, 반복 패턴, 일반적인 단어는 피하세요</span>
                          </li>
                        )}
                        {result.count > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-0.5">•</span>
                            <span>이 비밀번호는 {result.count.toLocaleString()}회 유출되었습니다. 즉시 변경하세요!</span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>다른 사이트와 같은 비밀번호를 사용하지 마세요</span>
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
                        비밀번호가 안전한 기준을 충족하고 있습니다.
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
