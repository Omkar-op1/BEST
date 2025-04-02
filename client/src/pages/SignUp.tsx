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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/lib/auth";

const formSchema = z.object({
  prnNumber: z.string().min(1, "PRN number is required"),
  email: z.string()
    .email("Please enter a valid email address")
    .refine(email => email.endsWith('@bitwardha.ac.in'), {
      message: "Email must end with @bitwardha.ac.in",
    }),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const register = useRegister();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prnNumber: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    register.mutate({
      prnNumber: values.prnNumber,
      email: values.email,
      username: values.username,
      password: values.password,
    });
  };

  return (
    <div className="py-12 flex justify-center">
      <Card className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <CardHeader className="py-4 px-6 bg-primary">
          <CardTitle className="text-2xl font-bold text-white text-center">Create an Account</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prnNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PRN Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="22010101"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="johndoe"
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
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      I agree to the <a href="#" className="text-blue-600 hover:text-blue-700">Terms and Conditions</a>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-orange-600" 
                disabled={register.isPending}
              >
                {register.isPending ? "Creating account..." : "Sign Up"}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-neutral-600">
                  Already have an account? <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
