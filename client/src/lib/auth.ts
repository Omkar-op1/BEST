import { apiRequest } from "./queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "./queryClient";
import { useLocation } from "wouter";
import { ExtendedUser } from "@shared/schema";

export const useUser = () => {
  return useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    staleTime: Infinity,
    onError: () => {},
  });
};

export const useLogin = () => {
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Success',
        description: 'You have been logged in',
      });
      setLocation('/test');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        variant: 'destructive',
      });
    },
  });
};

export const useRegister = () => {
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async (userData: ExtendedUser) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      setLocation('/signin');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });
};

export const useLogout = () => {
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.clear();
      toast({
        title: 'Success',
        description: 'You have been logged out',
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      });
    },
  });
};
