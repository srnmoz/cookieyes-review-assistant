import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import NewReview from "./pages/NewReview";
import ReviewDetail from "./pages/ReviewDetail";
import SavedReviews from "./pages/SavedReviews";
import StyleGuideSettings from "./pages/StyleGuideSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-review" element={<NewReview />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/reviews" element={<SavedReviews />} />
          <Route path="/style-guide" element={<StyleGuideSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
