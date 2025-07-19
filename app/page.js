"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            adminname: formData.username, 
            password: formData.password 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        return data;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred during login");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }
    loginMutation.mutate();
  };

  const isLoading = loginMutation.isPending;
  const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen w-full font-sans">
      <div className="flex flex-col md:items-start items-center justify-center gap-8 w-full md:w-2/3 md:px-20">
        <div className="flex items-center md:items-start flex-col">
          <h1 className="text-xl font-bold">Heyy, 👋</h1>
          <p className="text-gray-800">Please enter your credentials</p>
        </div>

        <form
          className="md:max-w-[400px] w-full md:px-0 px-8"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4 mb-4">
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="w-full md:w-[120px]">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !isFormValid}
              className="w-full md:h-10 h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> 
                  Logging In...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="hidden md:block w-1/3 h-screen" />
    </div>
  );
}