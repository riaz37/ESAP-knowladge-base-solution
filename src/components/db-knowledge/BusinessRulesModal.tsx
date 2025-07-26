"use client";
import { AlertCircle, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BusinessRulesModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  businessRulesText: string;
  businessRulesLoading: boolean;
  businessRulesError: string | null;
}

export default function BusinessRulesModal({
  isOpen,
  onClose,
  businessRulesText,
  businessRulesLoading,
  businessRulesError
}: BusinessRulesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-black/95 border-white/20 dark:border-white/10 shadow-2xl">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none" />
        {/* Subtle glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg opacity-30" />

        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-white/20 hover:scale-110 hover:rotate-1 transition-transform duration-200">
              <FileText className="h-5 w-5" />
            </div>
            Business Rules & Constraints
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Database business rules, constraints, and operational guidelines
          </DialogDescription>
        </DialogHeader>

        <Separator className="bg-white/20 dark:bg-white/10" />

        <div className="flex-1 overflow-auto relative">
          {businessRulesLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">
                Loading business rules...
              </p>
              <div className="w-full space-y-3">
                <Skeleton className="h-4 w-full bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                <Skeleton className="h-4 w-3/4 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                <Skeleton className="h-4 w-1/2 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
              </div>
            </div>
          ) : businessRulesError ? (
            <Card className="border-destructive/50 bg-destructive/5 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
              <CardContent className="relative flex items-center gap-3 pt-6">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-destructive font-medium">
                    Failed to Load Business Rules
                  </p>
                  <p className="text-destructive/80 text-sm">
                    {businessRulesError}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden backdrop-blur-sm bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
              <CardContent className="relative pt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {businessRulesText}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}