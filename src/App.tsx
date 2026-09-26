import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Repositories from "./pages/Repositories";
import CV from "./pages/CV";
import Projects from "./pages/Projects";
import Manifests from "./pages/Manifests";
import Services from "./pages/Services";
import Research from "./pages/Research";
import NotFound from "./pages/NotFound";
import AlfaOffer from "./pages/AlfaOffer";
import Library from "./pages/Library";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/cv" element={<CV />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/manifests" element={<Manifests />} />
            <Route path="/services" element={<Services />} />
            <Route path="/research" element={<Research />} />
            <Route path="/alfa" element={<AlfaOffer />} />
            <Route path="/biblioteka" element={<Library />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
