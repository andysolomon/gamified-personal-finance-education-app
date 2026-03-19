"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";

export function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age_band: profile?.age_band ?? undefined,
      financial_goals: profile?.financial_goals ?? [],
      risk_tolerance: profile?.risk_tolerance ?? undefined,
    },
  });

  const ageBand = watch("age_band");
  const financialGoals = watch("financial_goals");
  const riskTolerance = watch("risk_tolerance");

  async function onSubmit(data: ProfileInput) {
    if (!user) return;
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        age_band: data.age_band,
        financial_goals: data.financial_goals,
        risk_tolerance: data.risk_tolerance,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    setSuccess(true);
  }

  function toggleGoal(goal: string) {
    const current = financialGoals || [];
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    setValue("financial_goals", updated, { shouldValidate: true });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your financial profile and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              Profile updated successfully.
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-base font-medium">Age Range</Label>
            <div className="grid grid-cols-2 gap-2">
              {ageBandOptions.map((option) => (
                <Label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-md border p-2 text-sm transition-colors",
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
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Financial Goals</Label>
            <div className="space-y-2">
              {financialGoalOptions.map((goal) => (
                <Label
                  key={goal}
                  className={cn(
                    "flex cursor-pointer items-center rounded-md border p-3 text-sm transition-colors",
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
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Risk Tolerance</Label>
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
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
