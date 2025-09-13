// Import các component UI cần thiết cho ứng dụng
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Khởi tạo QueryClient để quản lý cache và state của API calls
const queryClient = new QueryClient();

// Component chính của ứng dụng - thiết lập các provider và routing
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toaster để hiển thị thông báo */}
      <Toaster />
      {/* Sonner để hiển thị thông báo toast đẹp hơn */}
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Trang chủ - dashboard quản lý task */}
          <Route path="/" element={<Index />} />
          {/* Trang đăng nhập/đăng ký */}
          <Route path="/auth" element={<Auth />} />
          {/* Route catch-all cho 404 - phải để cuối cùng */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
