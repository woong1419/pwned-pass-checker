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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">정보보안의 날 행사</h1>
            <p className="text-sm text-muted-foreground">비밀번호 유출 검사</p>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">19대 학생회 AI부 X 기획부</p>
      </footer>
    </div>
  );
};

export default Index;
