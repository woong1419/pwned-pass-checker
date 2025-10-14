import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const Survey = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({
    passwordChange: "",
    twoFactor: [] as string[],
    phishing: "",
    updateSoftware: "",
  });

  const handleCheckboxChange = (checked: boolean, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      twoFactor: checked
        ? [...prev.twoFactor, value]
        : prev.twoFactor.filter((item) => item !== value),
    }));
  };

  const handleSubmit = () => {
    if (!answers.passwordChange || answers.twoFactor.length === 0 || !answers.phishing || !answers.updateSoftware) {
      toast.error("모든 문항에 답변해주세요");
      return;
    }

    setSubmitted(true);
    toast.success("설문조사가 완료되었습니다!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">설문조사 완료!</CardTitle>
            <CardDescription>
              정보보안의 날 설문조사에 참여해주셔서 감사합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate("/")} className="w-full">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">정보보안 인식 조사</h1>
            <p className="text-muted-foreground">
              여러분의 정보보안 습관을 점검해보세요
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. 비밀번호를 얼마나 자주 변경하시나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers.passwordChange}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, passwordChange: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer">매월</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quarterly" id="quarterly" />
                    <Label htmlFor="quarterly" className="cursor-pointer">3개월마다</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly" className="cursor-pointer">1년마다</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never" className="cursor-pointer">거의 변경하지 않음</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Question 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. 사용 중인 보안 기능을 모두 선택해주세요</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="2fa"
                    checked={answers.twoFactor.includes("2fa")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(checked as boolean, "2fa")
                    }
                  />
                  <Label htmlFor="2fa" className="cursor-pointer">
                    2단계 인증 (OTP, SMS 인증 등)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="biometric"
                    checked={answers.twoFactor.includes("biometric")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(checked as boolean, "biometric")
                    }
                  />
                  <Label htmlFor="biometric" className="cursor-pointer">
                    생체 인증 (지문, 얼굴 인식)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="password-manager"
                    checked={answers.twoFactor.includes("password-manager")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(checked as boolean, "password-manager")
                    }
                  />
                  <Label htmlFor="password-manager" className="cursor-pointer">
                    비밀번호 관리 프로그램
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="none"
                    checked={answers.twoFactor.includes("none")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(checked as boolean, "none")
                    }
                  />
                  <Label htmlFor="none" className="cursor-pointer">
                    사용하지 않음
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Question 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. 의심스러운 이메일이나 링크를 받으면 어떻게 하시나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers.phishing}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, phishing: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ignore" id="ignore" />
                    <Label htmlFor="ignore" className="cursor-pointer">무시하고 삭제한다</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="check" id="check" />
                    <Label htmlFor="check" className="cursor-pointer">발신자를 확인한다</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="click" id="click" />
                    <Label htmlFor="click" className="cursor-pointer">일단 클릭해본다</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="report" id="report" />
                    <Label htmlFor="report" className="cursor-pointer">신고한다</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Question 4 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. 소프트웨어 업데이트를 얼마나 자주 하시나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers.updateSoftware}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, updateSoftware: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediately" id="immediately" />
                    <Label htmlFor="immediately" className="cursor-pointer">알림이 오면 즉시 업데이트</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="cursor-pointer">일주일에 한 번</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly-update" id="monthly-update" />
                    <Label htmlFor="monthly-update" className="cursor-pointer">한 달에 한 번</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rarely" id="rarely" />
                    <Label htmlFor="rarely" className="cursor-pointer">거의 하지 않음</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                취소
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                제출하기
              </Button>
            </div>
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
