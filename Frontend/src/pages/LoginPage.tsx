/* eslint-disable */
import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import api from "@/services/api";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";
import {
  Ripple,
  TechOrbitDisplay,
  AnimatedForm,
} from "@/components/ui/modern-animated-sign-in";

type FormData = {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: string;
};

const Icon = ({ src, alt }: { src: string; alt: string }) => (
  <img
    width={100}
    height={100}
    src={src}
    alt={alt}
    className="w-full h-full object-contain"
  />
);

const DEV = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const iconsArray = [
  // Ring 1 — r=100, 2 icons, forward
  {
    component: () => (
      <Icon src={`${DEV}/python/python-original.svg`} alt="Python" />
    ),
    className: "size-[40px] border-none bg-transparent",
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <Icon src={`${DEV}/java/java-original.svg`} alt="Java" />,
    className: "size-[40px] border-none bg-transparent",
    duration: 20,
    delay: 10,
    radius: 100,
    path: false,
    reverse: false,
  },
  // Ring 2 — r=150, 2 icons, reverse
  {
    component: () => (
      <Icon src={`${DEV}/cplusplus/cplusplus-original.svg`} alt="C++" />
    ),
    className: "size-[40px] border-none bg-transparent",
    duration: 20,
    delay: 20,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <Icon src={`${DEV}/go/go-original-wordmark.svg`} alt="Go" />
    ),
    className: "size-[40px] border-none bg-transparent",
    duration: 20,
    delay: 10,
    radius: 150,
    path: false,
    reverse: true,
  },
  // Ring 3 — r=210, 2 icons, forward
  {
    component: () => (
      <Icon
        src={`${DEV}/javascript/javascript-original.svg`}
        alt="JavaScript"
      />
    ),
    className: "size-[50px] border-none bg-transparent",
    duration: 20,
    delay: 0,
    radius: 210,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <Icon
        src={`${DEV}/typescript/typescript-original.svg`}
        alt="TypeScript"
      />
    ),
    className: "size-[50px] border-none bg-transparent",
    duration: 20,
    delay: 20,
    radius: 210,
    path: false,
    reverse: false,
  },
  // Ring 4 — r=270, 2 icons, reverse
  {
    component: () => (
      <Icon src={`${DEV}/react/react-original.svg`} alt="React" />
    ),
    className: "size-[50px] border-none bg-transparent",
    duration: 20,
    delay: 0,
    radius: 270,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <Icon src={`${DEV}/nodejs/nodejs-original.svg`} alt="Node.js" />
    ),
    className: "size-[50px] border-none bg-transparent",
    duration: 20,
    delay: 10,
    radius: 270,
    path: false,
    reverse: true,
  },
  // Ring 5 — r=320, 1 icon, forward
  {
    component: () => <Icon src={`${DEV}/git/git-original.svg`} alt="Git" />,
    className: "size-[50px] border-none bg-transparent",
    duration: 20,
    delay: 20,
    radius: 320,
    path: false,
    reverse: false,
  },
];

export default function AuthPage() {
  const { user, loading } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin" || user.role === "Master_ADMIN")
        navigate("/admin/courses", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post("/auth/local/login", payload);
      if (data?.blueirect) {
        window.location.href = data.blueirect;
        return true;
      }
      window.location.reload();
      return true;
    },
    onError: (err: any) =>
      setError(err?.response?.data?.error || err?.message || "Login failed"),
  });

  const signupMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      phoneNumber: string;
    }) => {
      await api.post("/auth/local/register", payload);
      window.location.reload();
      return true;
    },
    onError: (err: any) =>
      setError(err?.response?.data?.error || err?.message || "Signup failed"),
  });

  const handleInputChange =
    (name: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    await loginMutation.mutateAsync({
      email: formData.email,
      password: formData.password,
    });
  };

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    await signupMutation.mutateAsync({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phoneNumber: formData.phoneNumber,
    });
  };

  const loginFields = {
    header: "Welcome back",
    subHeader: "Sign in to continue your placement preparation",
    fields: [
      {
        label: "Email",
        required: true,
        type: "email" as const,
        placeholder: "you@example.com",
        onChange: handleInputChange("email"),
      },
      {
        label: "Password",
        required: true,
        type: "password" as const,
        placeholder: "Enter your password",
        onChange: handleInputChange("password"),
      },
    ],
    submitButton: "Sign In",
    textVariantButton: "Don't have an account? Sign up",
  };

  const signupFields = {
    header: "Create account",
    subHeader: "Start your placement prep journey today",
    fields: [
      {
        label: "Name",
        required: true,
        type: "text" as const,
        placeholder: "John Doe",
        onChange: handleInputChange("name"),
      },
      {
        label: "Phone",
        required: true,
        type: "text" as const,
        placeholder: "+91 **********",
        onChange: handleInputChange("phoneNumber"),
      },
      {
        label: "Email",
        required: true,
        type: "email" as const,
        placeholder: "you@example.com",
        onChange: handleInputChange("email"),
      },
      {
        label: "Password",
        required: true,
        type: "password" as const,
        placeholder: "Create a password",
        onChange: handleInputChange("password"),
      },
    ],
    submitButton: "Create Account",
    textVariantButton: "Already have an account? Sign in",
  };

  const currentFields = isLogin ? loginFields : signupFields;

  return (
    <DarkGradientBg className="text-[#e5e1e4]">
      <section className="flex max-lg:justify-center">
        {/* Left Side - Orbit Display */}
        <span className="flex flex-col justify-center w-1/2 h-[100dvh] max-lg:hidden relative">
          <Ripple mainCircleSize={100} />
          <TechOrbitDisplay iconsArray={iconsArray} text="FresherReady" />
        </span>

        {/* Right Side - Form */}
        <span className="w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]">
          <AnimatedForm
            {...currentFields}
            fieldPerRow={1}
            onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
            goTo={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            googleLogin="Login with Google"
            errorField={error}
            isPending={
              isLogin ? loginMutation.isPending : signupMutation.isPending
            }
          />
        </span>
      </section>
    </DarkGradientBg>
  );
}
