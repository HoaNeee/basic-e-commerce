/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
// import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingComponent from "@/components/LoadingComponent";
import LOGO from "../../../assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { post } from "@/utils/requets";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addAuth } from "@/redux/reducer/authReducer";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z
    .string({
      message: "Please enter this field!",
    })
    .email(),
  password: z.string().min(1, {
    message: "Please enter this field!",
  }),
  isRemmember: z.any(),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  // const auth = useSelector((state: RootState) => state.auth.auth);
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isRemmember: false,
    },
  });

  const router = useRouter();

  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await post("/auth/login", values);
      toast.success(response.message, {
        description: "Login successfully, Welcome!",
      });
      dispatch(addAuth(response.data));
      router.replace(next ? next : "/");
    } catch (error: any) {
      toast.error(error.message, {
        description: "Login failed!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex gap-2">
      <div className="bg-[url(../assets/auth-login.jpg)] bg-no-repeat bg-cover h-full md:w-5/9 md:block hidden">
        <Image alt="LOGO" src={LOGO} className="mt-5 ml-5" priority />
      </div>
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="mb-8">
          <h3 className="text-3xl font-bold">Welcome 👋</h3>
          <p className="text-neutral-400 text-sm">Please login here</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <FormItem {...field}>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        className="py-5"
                        placeholder="Your Email Address"
                        name="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem {...field}>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        className="py-5"
                        placeholder="Your Password"
                        name="password"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="isRemmember"
              render={({ field }) => {
                return (
                  <FormItem {...field}>
                    <FormControl>
                      <div className="flex justify-between items-center my-3">
                        <div className="flex gap-2 items-center">
                          <Checkbox id="remember" />
                          <Label htmlFor="remember">Remember me</Label>
                        </div>
                        <Link
                          href={"/auth/forgot-password"}
                          className="text-sm font-medium italic"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <Button
              disabled={isLoading}
              type="submit"
              className="py-6 transition-all duration-400 flex items-center justify-center relative"
            >
              <div
                className="opacity-0 transition-all duration-300 invisible"
                style={{
                  opacity: isLoading ? "1" : undefined,
                  visibility: isLoading ? "visible" : undefined,
                }}
              >
                <LoadingComponent size={50} />
              </div>
              {
                <p
                  className="transition-all duration-300 absolute flex items-center justify-center"
                  style={{
                    marginLeft: isLoading ? "86px" : undefined,
                  }}
                >
                  Login
                </p>
              }
            </Button>

            <div className="text-center mt-5">
              <p>
                {"Don't have an account? "}{" "}
                <Link
                  href={`/auth/register${
                    next ? `?next=${encodeURIComponent(next)}` : ""
                  }`}
                  className="text-blue-600 italic"
                >
                  register
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
