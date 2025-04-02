import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Feedback from "@/components/Feedback";
import { useUser } from "@/lib/auth";
import { Vegetable } from "@shared/schema";

const Test = () => {
  const [, setLocation] = useLocation();
  const { data: user, isSuccess: isLoggedIn, isLoading: isUserLoading } = useUser();
  
  useEffect(() => {
    // Redirect to sign in if not logged in
    if (!isUserLoading && !isLoggedIn) {
      setLocation('/signin');
    }
  }, [isLoggedIn, isUserLoading, setLocation]);
  
  const { data: vegetables, isLoading } = useQuery<Vegetable[]>({
    queryKey: ['/api/vegetables'],
    enabled: isLoggedIn,
  });
  
  if (isLoading || isUserLoading) {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
              
              <div className="bg-neutral-100 rounded-lg p-6 shadow-inner">
                <Skeleton className="h-6 w-40 mx-auto mb-4" />
                <Skeleton className="h-48 w-full rounded-lg mb-6" />
                <Skeleton className="h-4 w-64 mx-auto mb-6" />
                
                <div className="flex justify-center space-x-8">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <Skeleton className="h-24 w-24 rounded-lg" />
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
              
              <div className="mt-8 flex justify-center">
                <Skeleton className="h-12 w-40" />
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return null; // Redirect is handled in useEffect
  }
  
  return (
    <section className="py-12">
      <div className="max-w-2xl mx-auto">
        {vegetables && vegetables.length > 0 ? (
          <Feedback vegetables={vegetables} />
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p>No vegetables available for feedback at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default Test;
