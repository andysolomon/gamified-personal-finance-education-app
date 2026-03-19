"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileInput,
  ageBandOptions,
  riskToleranceOptions,
  financialGoalOptions,
} from "@/lib/validations/profile";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "./step-indicator";
import { cn } from "@/lib/utils";

export function OnboardingForm() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      financial_goals: [],
    },
  });

  const ageBand = watch("age_band");
  const financialGoals = watch("financial_goals");
  const riskTolerance = watch("risk_tolerance");

  async function onSubmit(data: ProfileInput) {
    if (!user) return;
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        age_band: data.age_band,
        financial_goals: data.financial_goals,
        risk_tolerance: data.risk_tolerance,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    router.push("/dashboard");
    router.refresh();
  }

  function toggleGoal(goal: string) {
    const current = financialGoals || [];
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    setValue("financial_goals", updated, { shouldValidate: true });
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <StepIndicator currentStep={step} totalSteps={3} />
        <CardTitle className="mt-4 text-2xl">
          {step === 1 && "What's your age range?"}
          {step === 2 && "What are your financial goals?"}
          {step === 3 && "What's your risk tolerance?"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "This helps us tailor content to your life stage"}
          {step === 2 && "Select one or more goals you want to work toward"}
          {step === 3 && "This shapes your learning path and recommendations"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              {ageBandOptions.map((option) => (
                <Label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center rounded-md border p-3 transition-colors",
                    ageBand === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted",
                  )}
                >
                  <input
                    type="radio"
                    name="age_band"
                    value={option.value}
                    checked={ageBand === option.value}
                    onChange={() => setValue("age_band", option.value, { shouldValidate: true })}
                    className="sr-only"
                  />
                  {option.label}
                </Label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              {financialGoalOptions.map((goal) => (
                <Label
                  key={goal}
                  className={cn(
                    "flex cursor-pointer items-center rounded-md border p-3 transition-colors",
                    financialGoals?.includes(goal)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={financialGoals?.includes(goal) || false}
                    onChange={() => toggleGoal(goal)}
                    className="sr-only"
                  />
                  {goal}
                </Label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              {riskToleranceOptions.map((option) => (
                <Label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-md border p-3 transition-colors",
                    riskTolerance === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted",
                  )}
                >
                  <input
                    type="radio"
                    name="risk_tolerance"
                    value={option.value}
                    checked={riskTolerance === option.value}
                    onChange={() =>
                      setValue("risk_tolerance", option.value, { shouldValidate: true })
                    }
                    className="sr-only"
                  />
                  <span className="font-medium">{option.label}</span>
                  <span className="text-muted-foreground text-sm">{option.description}</span>
                </Label>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                className="flex-1"
                disabled={
                  (step === 1 && !ageBand) ||
                  (step === 2 && (!financialGoals || financialGoals.length === 0))
                }
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1"
                disabled={!riskTolerance || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
