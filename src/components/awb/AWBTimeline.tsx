import type { AirWaybill, AWBStatus } from "@/lib/types";
import { AWB_WORKFLOW, STATUS_LABELS, STATUS_COLORS } from "@/constants/awbStatuses";
import { Check, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface AWBTimelineProps {
  awb: AirWaybill;
  onAdvanceStatus?: (newStatus: AWBStatus) => void;
}

export function AWBTimeline({ awb, onAdvanceStatus }: AWBTimelineProps) {
  const states = AWB_WORKFLOW;
  const currentIndex = states.indexOf(awb.status as any);

  return (
    <div className="space-y-1">
      {states.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const isNext = index === currentIndex + 1;

        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center w-8">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? "bg-success"
                    : isCurrent
                    ? "gradient-primary ring-2 ring-primary/30"
                    : "bg-secondary border border-border"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 text-success-foreground" />
                ) : isCurrent ? (
                  <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>
              {index < states.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    isCompleted ? "bg-success/50" : "bg-border"
                  }`}
                />
              )}
            </div>

            <div className={`pb-4 flex-1 ${isPending ? "opacity-40" : ""}`}>
              <div className="flex items-center justify-between">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {STATUS_LABELS[status] || status}
                </p>
                {isNext && onAdvanceStatus && (
                  <button
                    onClick={() => onAdvanceStatus(status)}
                    className="text-xs px-3 py-1 rounded-md gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                  >
                    Avanzar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
