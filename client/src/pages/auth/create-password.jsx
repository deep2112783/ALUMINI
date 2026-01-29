import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, Loader2 } from "lucide-react";
import { useCreatePassword } from "@/hooks/use-api";

const createPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function CreatePassword() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const createPasswordMutation = useCreatePassword();
  const form = useForm({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data) {
    setError("");
    try {
      const email = sessionStorage.getItem("pendingEmail") || "";
      if (!email) {
        setError("Email not found. Please login again.");
        setLocation("/auth/login");
        return;
      }
      const result = await createPasswordMutation.mutateAsync({
        email,
        password: data.password,
      });
      if (result.token) {
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("role", result.role || "student");
        sessionStorage.setItem("userId", result.userId);
        sessionStorage.removeItem("pendingEmail");
        
        const role = result.role || "student";
        if (role === "student") setLocation("/student/home");
        else if (role === "alumni") setLocation("/alumni/home");
        else if (role === "faculty") setLocation("/faculty/home");
      }
    } catch (err) {
      setError(err.message || "Failed to create password. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <CardHeader className="text-center space-y-2">
           <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create Password</CardTitle>
          <CardDescription className="text-gray-500">
            Set up your account password for first-time access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <div className="bg-red-50 text-red-800 text-xs p-4 rounded-lg border border-red-200">
                  <p className="font-bold">Error: {error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={createPasswordMutation.isPending}
              >
                {createPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Set Password & Continue"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

