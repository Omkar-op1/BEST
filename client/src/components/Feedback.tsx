import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Vegetable } from "@shared/schema";

interface FeedbackProps {
  vegetables: Vegetable[];
}

const Feedback = ({ vegetables }: FeedbackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: boolean }>({});
  const [, setLocation] = useLocation();

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < vegetables.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleResponse = (vegetableId: number, isLiked: boolean) => {
    setResponses({ ...responses, [vegetableId]: isLiked });
  };

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackItem: { vegetableId: number; isLiked: boolean }) => {
      const res = await apiRequest('POST', '/api/feedback', feedbackItem);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit feedback',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    // Check if all vegetables have been rated
    if (Object.keys(responses).length !== vegetables.length) {
      toast({
        title: 'Warning',
        description: 'Please provide feedback for all vegetables before submitting',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Submit all responses
      for (const [vegId, isLiked] of Object.entries(responses)) {
        await submitFeedbackMutation.mutateAsync({
          vegetableId: parseInt(vegId),
          isLiked,
        });
      }

      toast({
        title: 'Success',
        description: 'Your feedback has been submitted successfully',
      });

      // Navigate to dashboard
      setLocation('/dashboard');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isFirstVegetable = currentIndex === 0;
  const isLastVegetable = currentIndex === vegetables.length - 1;
  const currentVegetable = vegetables[currentIndex];
  const progress = ((currentIndex + 1) / vegetables.length) * 100;
  const hasResponded = currentVegetable && responses[currentVegetable.id] !== undefined;

  if (vegetables.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">No vegetables available for feedback.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="py-4 px-6 bg-primary">
        <CardTitle className="text-2xl font-bold text-white text-center">Vegetable Feedback Test</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center mb-8">
          <CardDescription className="text-lg text-neutral-600">
            Please provide your feedback on today's vegetables served in the mess.
          </CardDescription>
          <p className="text-sm text-neutral-600 mt-2">Your feedback helps us improve the menu!</p>
        </div>

        <div className="bg-neutral-100 rounded-lg p-6 shadow-inner">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{currentVegetable.name}</h3>
            <img
              src={currentVegetable.imageUrl}
              alt={currentVegetable.name}
              className="mx-auto rounded-lg shadow-md h-48 object-cover mb-6"
            />

            <p className="mb-6 text-neutral-600">How did you like this vegetable?</p>

            <div className="flex justify-center space-x-8">
              <Button
                variant="ghost"
                className={`flex flex-col items-center p-4 rounded-lg ${
                  hasResponded && responses[currentVegetable.id]
                    ? 'bg-green-100'
                    : 'hover:bg-green-100'
                } focus:outline-none transition duration-150`}
                onClick={() => handleResponse(currentVegetable.id, true)}
              >
                <ThumbsUp className="h-10 w-10 text-green-500" />
                <span className="mt-2 font-medium">Like</span>
              </Button>

              <Button
                variant="ghost"
                className={`flex flex-col items-center p-4 rounded-lg ${
                  hasResponded && !responses[currentVegetable.id]
                    ? 'bg-red-100'
                    : 'hover:bg-red-100'
                } focus:outline-none transition duration-150`}
                onClick={() => handleResponse(currentVegetable.id, false)}
              >
                <ThumbsDown className="h-10 w-10 text-red-500" />
                <span className="mt-2 font-medium">Dislike</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstVegetable}
            className="flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>

          <Button
            variant="secondary"
            onClick={handleNext}
            disabled={isLastVegetable}
            className="flex items-center justify-center"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="default"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-sky-700"
            disabled={submitFeedbackMutation.isPending}
          >
            {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-neutral-600 mb-2">
            <span>Progress</span>
            <span>{currentIndex + 1}/{vegetables.length} vegetables</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>
      </CardContent>
    </Card>
  );
};

export default Feedback;
