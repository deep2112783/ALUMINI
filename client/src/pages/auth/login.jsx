import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GraduationCap, Loader2 } from "lucide-react";
import { useLogin, useCheckEmail } from "@/hooks/use-api";

const ALLOWED_DOMAIN = "@rguktrkv.ac.in";

const emailSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((email) => email.trim().toLowerCase())
    .refine((email) => email.endsWith(ALLOWED_DOMAIN), "Only RGUKT RKV college emails are allowed"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const [step, setStep] = useState("email"); // "email" or "password"
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const checkEmailMutation = useCheckEmail();
  const loginMutation = useLogin();
  const form = useForm({
    resolver: zodResolver(step === "email" ? emailSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onEmailSubmit(data) {
    setError("");
    try {
      const result = await checkEmailMutation.mutateAsync({ email: data.email });
      setVerifiedEmail(data.email);
      
      if (result.hasPassword) {
        // User has password, show password field
        setStep("password");
      } else {
        // No password set, redirect to create password
        sessionStorage.setItem("pendingEmail", data.email);
        setLocation("/auth/create-password");
      }
    } catch (err) {
      setError(err.message || "Failed to verify email.");
    }
  }

  async function onPasswordSubmit(data) {
    setError("");
    try {
      const result = await loginMutation.mutateAsync({ email: verifiedEmail, password: data.password });
      if (result.token && result.role) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("email", verifiedEmail);
        
        // Also store user info in sessionStorage for use in hooks
        sessionStorage.setItem("user", JSON.stringify({
          id: result.userId,
          role: result.role,
          email: verifiedEmail
        }));
        
        if (result.role === "student") setLocation("/student/home");
        else if (result.role === "alumni") setLocation("/alumni/home");
        else if (result.role === "faculty") setLocation("/faculty/home");
      } else {
        setError("Login response missing token or role.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  }

  function onSubmit(data) {
    if (step === "email") {
      onEmailSubmit(data);
    } else {
      onPasswordSubmit(data);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md fade-in-up">
        <Card className="border border-gray-200 shadow-xl hover-lift">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-xl w-fit mb-2">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-500 font-medium">
              Sign in to RGUKT RKV Alumni Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-700">College Email ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={`id${ALLOWED_DOMAIN}`} 
                          className="h-11 border-gray-200 focus-visible:ring-2 focus-visible:ring-primary rounded-lg smooth-transition"
                          disabled={step === "password"}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {step === "password" && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-11 border-gray-200 focus-visible:ring-2 focus-visible:ring-primary rounded-lg smooth-transition"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {error && (
                  <div className="bg-red-50 text-red-800 text-xs p-4 rounded-lg border border-red-200 space-y-1">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-lg border border-blue-200 space-y-1">
                  <p className="font-bold">Note:</p>
                  <p>Only verified RGUKT RKV college emails are allowed to access this platform.</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold shadow-md hover:shadow-lg smooth-transition text-base"
                  disabled={checkEmailMutation.isPending || loginMutation.isPending}
                >
                  {(checkEmailMutation.isPending || loginMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {step === "email" ? "Verifying..." : "Signing in..."}
                    </>
                  ) : (
                    step === "email" ? "Continue" : "Sign In"
                  )}
                </Button>
                
                {step === "password" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("email");
                      setVerifiedEmail("");
                      form.setValue("password", "");
                      setError("");
                    }}
                    className="w-full"
                  >
                    Change Email
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white">
            <p className="text-sm text-gray-600">
              First time user? <Link href="/auth/create-password" className="text-primary font-bold hover:underline smooth-transition">Create Password</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

