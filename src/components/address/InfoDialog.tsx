import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function InfoDialog({ isOpen, onClose, title, content }: InfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}