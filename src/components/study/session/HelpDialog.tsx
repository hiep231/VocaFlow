import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function HelpDialog() {
  const ratings = [
    {
      label: "Fail (Lại)",
      description: "Quên hoàn toàn hoặc trả lời sai.",
      interval: "10-15 phút",
      color: "text-destructive",
    },
    {
      label: "Hard (Khó)",
      description: "Nhớ mang máng, tốn nhiều sức mới nhớ ra.",
      interval: "khoảng 1 ngày",
      color: "text-orange-600",
    },
    {
      label: "Good (Tốt)",
      description: "Nhớ ngay lập tức, trả lời chính xác.",
      interval: "vài ngày, 1 tuần...",
      color: "text-green-600",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-white/10 gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          Hướng dẫn đánh giá
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Hướng dẫn đánh giá (SRS)</DialogTitle>
          <DialogDescription>
            Hệ thống lặp lại ngắt quãng (SRS) giúp bạn ghi nhớ từ vựng hiệu quả
            hơn.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {ratings.map((item) => (
            <div
              key={item.label}
              className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-start"
            >
              <div className={`min-w-[80px] font-bold ${item.color}`}>
                {item.label}
              </div>
              <div className="space-y-1">
                <p className="font-medium">{item.description}</p>
                <p className="text-sm text-muted-foreground">
                  Khoảng cách ôn tập: {item.interval}.
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
