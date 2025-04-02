import { Link } from "wouter";
import Carousel from "@/components/Carousel";
import { Button } from "@/components/ui/button";
import { Check, ThumbsUp, BarChart2, Lock } from "lucide-react";

const Home = () => {
  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      alt: "Food plate with variety of items"
    },
    {
      url: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      alt: "Hostel mess hall"
    },
    {
      url: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      alt: "Food serving line"
    }
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carousel */}
        <Carousel images={carouselImages} height="400px" />
        
        {/* About BEST section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-3xl font-bold text-neutral-800 mb-6 border-b pb-3">About BEST</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg mb-4">BEST (Bajaj Eating Serve Test) is a platform designed to collect feedback from students about the mess food quality and preferences.</p>
              <p className="text-lg mb-4">Our mission is to improve the dining experience for all students by collecting valuable feedback on the vegetables served during lunch and dinner.</p>
              <p className="text-lg mb-4">By participating in our simple like/dislike tests, you help the mess committee make better decisions about the menu.</p>
              <div className="mt-6">
                <Link href="/signup">
                  <Button variant="default" size="lg" className="bg-primary hover:bg-orange-600 text-white font-semibold">
                    Join BEST Today
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Students enjoying food" 
                className="rounded-lg shadow-md max-w-full h-auto" 
              />
            </div>
          </div>
          
          {/* Key features section */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-neutral-800 mb-6">Key Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-neutral-100 p-6 rounded-lg">
                <div className="text-primary mb-4">
                  <ThumbsUp className="h-12 w-12" />
                </div>
                <h4 className="text-xl font-medium mb-2">Simple Feedback</h4>
                <p>Provide feedback on vegetables with a simple like or dislike option. No complex forms to fill out.</p>
              </div>
              <div className="bg-neutral-100 p-6 rounded-lg">
                <div className="text-primary mb-4">
                  <BarChart2 className="h-12 w-12" />
                </div>
                <h4 className="text-xl font-medium mb-2">Real-time Dashboard</h4>
                <p>View live statistics on food preferences through our interactive dashboard with visual charts.</p>
              </div>
              <div className="bg-neutral-100 p-6 rounded-lg">
                <div className="text-primary mb-4">
                  <Lock className="h-12 w-12" />
                </div>
                <h4 className="text-xl font-medium mb-2">Secure Access</h4>
                <p>Only registered students with valid college email addresses can access the system.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
