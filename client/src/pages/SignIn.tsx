import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/lib/auth";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const login = useLogin();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    login.mutate({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div className="py-12 flex justify-center">
      <Card className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <CardHeader className="py-4 px-6 bg-primary">
          <CardTitle className="text-2xl font-bold text-white text-center">Sign In to BEST</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="yourname@bitwardha.ac.in"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-orange-600" 
                disabled={login.isPending}
              >
                {login.isPending ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-neutral-600">
                  Don't have an account? <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">Sign up</Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
