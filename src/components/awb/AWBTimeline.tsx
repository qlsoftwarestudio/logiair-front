import type { AirWaybill, AWBStatus } from "@/lib/types";
import { AWB_WORKFLOW, AWB_BRANCH_STATUS, AWB_TRANSITIONS, STATUS_LABELS } from "@/constants/awbStatuses";
import { Check, Clock, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

interface AWBTimelineProps {
  awb: AirWaybill;
  onAdvanceStatus?: (newStatus: AWBStatus) => void;
}

export function AWBTimeline({ awb, onAdvanceStatus }: AWBTimelineProps) {
  const states = AWB_WORKFLOW;
  const currentStatus = awb.status as AWBStatus;
  const isBranched = currentStatus === AWB_BRANCH_STATUS;
  const currentIndex = isBranched
    ? states.indexOf("CUSTOMS_PRESENTED")
    : states.indexOf(currentStatus);

  const nextStatuses = AWB_TRANSITIONS[currentStatus] || [];

  return (
    <div className="space-y-1">
      {states.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex && !isBranched;
        const isPending = index > currentIndex;

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

            <div className={`pb-4 flex-1 ${isPending && !isBranched ? "opacity-40" : ""}`}>
              <div className="flex items-center justify-between">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {STATUS_LABELS[status] || status}
                </p>
                {onAdvanceStatus && nextStatuses.includes(status) && (
                  <button
                    onClick={() => onAdvanceStatus(status)}
                    className="text-xs px-3 py-1 rounded-md gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                  >
                    Avanzar
                  </button>
                )}
              </div>

              {/* Show branch indicator at CUSTOMS_PRESENTED */}
              {status === "CUSTOMS_PRESENTED" && (isCurrent || isCompleted) && (
                <div className="mt-2 flex items-center gap-2">
                  <GitBranch className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Bifurcación: Despacho Liberado ó Manifiesto Registrado
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Show branch status if active */}
      {isBranched && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4 ml-4 border-l-2 border-success/50 pl-4"
        >
          <div className="flex flex-col items-center w-8">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 gradient-primary ring-2 ring-primary/30">
              <Clock className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          </div>
          <div className="pb-4 flex-1">
            <p className="text-sm font-semibold text-primary">
              {STATUS_LABELS[AWB_BRANCH_STATUS]} (rama alternativa)
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
