"use client";

import { useCallback, useMemo } from "react";
import { Clock, Calendar, Tag, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduleData {
  publishEnabled: boolean;
  publishDate: string;
  publishTime: string;
  publishTimezone: string;
  saleEnabled: boolean;
  saleStartDate: string;
  saleStartTime: string;
  saleEndDate: string;
  saleEndTime: string;
  salePrice: string;
}

export const DEFAULT_SCHEDULE: ScheduleData = {
  publishEnabled: false,
  publishDate: "",
  publishTime: "",
  publishTimezone: "GST",
  saleEnabled: false,
  saleStartDate: "",
  saleStartTime: "",
  saleEndDate: "",
  saleEndTime: "",
  salePrice: "",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductScheduleProps {
  schedule: ScheduleData;
  onChange: (schedule: ScheduleData) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INPUT_CLS =
  "w-full bg-lvl-slate border border-lvl-slate/50 text-lvl-white rounded-lg px-4 py-2.5 font-body text-sm placeholder:text-lvl-smoke/50 focus:outline-none focus:ring-1 focus:ring-lvl-yellow transition-colors";

function formatScheduleLabel(date: string, time: string): string {
  if (!date) return "";
  const parts: string[] = [date];
  if (time) parts.push(time);
  return parts.join(" at ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductSchedule({ schedule, onChange }: ProductScheduleProps) {
  const update = useCallback(
    (patch: Partial<ScheduleData>) => {
      onChange({ ...schedule, ...patch });
    },
    [schedule, onChange]
  );

  // ---- Timeline events ----------------------------------------------------

  const timelineEvents = useMemo(() => {
    const events: { label: string; datetime: string; color: string }[] = [];

    if (schedule.publishEnabled && schedule.publishDate) {
      events.push({
        label: "Publish",
        datetime: formatScheduleLabel(schedule.publishDate, schedule.publishTime),
        color: "bg-green-400",
      });
    }

    if (schedule.saleEnabled && schedule.saleStartDate) {
      events.push({
        label: "Sale Start",
        datetime: formatScheduleLabel(schedule.saleStartDate, schedule.saleStartTime),
        color: "bg-lvl-yellow",
      });
    }

    if (schedule.saleEnabled && schedule.saleEndDate) {
      events.push({
        label: "Sale End",
        datetime: formatScheduleLabel(schedule.saleEndDate, schedule.saleEndTime),
        color: "bg-red-400",
      });
    }

    return events;
  }, [schedule]);

  // ---- Validation ---------------------------------------------------------

  const saleEndBeforeStart = useMemo(() => {
    if (!schedule.saleEnabled || !schedule.saleStartDate || !schedule.saleEndDate) {
      return false;
    }
    const start = new Date(`${schedule.saleStartDate}T${schedule.saleStartTime || "00:00"}`);
    const end = new Date(`${schedule.saleEndDate}T${schedule.saleEndTime || "00:00"}`);
    return end <= start;
  }, [schedule]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ── Schedule Publication ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-lvl-smoke" />
            <p className="text-sm font-body text-lvl-white">
              Schedule Publication
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={schedule.publishEnabled}
            onClick={() => update({ publishEnabled: !schedule.publishEnabled })}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors",
              schedule.publishEnabled ? "bg-lvl-yellow" : "bg-lvl-slate"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-lvl-black rounded-full transition-transform",
                schedule.publishEnabled && "translate-x-5"
              )}
            />
          </button>
        </div>

        {schedule.publishEnabled && (
          <div className="space-y-3 pl-6 border-l-2 border-lvl-slate/50 ml-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-body text-lvl-smoke mb-1">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={schedule.publishDate}
                  onChange={(e) => update({ publishDate: e.target.value })}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="block text-xs font-body text-lvl-smoke mb-1">
                  Publish Time
                </label>
                <input
                  type="time"
                  value={schedule.publishTime}
                  onChange={(e) => update({ publishTime: e.target.value })}
                  className={INPUT_CLS}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-lvl-smoke" />
              <span className="text-xs font-body text-lvl-smoke">
                Timezone: {schedule.publishTimezone} (Gulf Standard Time)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Schedule Sale ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-lvl-smoke" />
            <p className="text-sm font-body text-lvl-white">
              Schedule Sale
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={schedule.saleEnabled}
            onClick={() => update({ saleEnabled: !schedule.saleEnabled })}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors",
              schedule.saleEnabled ? "bg-lvl-yellow" : "bg-lvl-slate"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-lvl-black rounded-full transition-transform",
                schedule.saleEnabled && "translate-x-5"
              )}
            />
          </button>
        </div>

        {schedule.saleEnabled && (
          <div className="space-y-4 pl-6 border-l-2 border-lvl-slate/50 ml-2">
            {/* Sale Price */}
            <div>
              <label className="block text-xs font-body text-lvl-smoke mb-1">
                Sale Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={schedule.salePrice}
                onChange={(e) => update({ salePrice: e.target.value })}
                placeholder="0.00"
                className={cn(INPUT_CLS, "max-w-[200px]")}
              />
            </div>

            {/* Sale Start */}
            <div>
              <p className="text-xs font-display font-bold tracking-wider text-lvl-smoke uppercase mb-2">
                Sale Start
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-body text-lvl-smoke mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={schedule.saleStartDate}
                    onChange={(e) => update({ saleStartDate: e.target.value })}
                    className={INPUT_CLS}
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-lvl-smoke mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={schedule.saleStartTime}
                    onChange={(e) => update({ saleStartTime: e.target.value })}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>

            {/* Sale End */}
            <div>
              <p className="text-xs font-display font-bold tracking-wider text-lvl-smoke uppercase mb-2">
                Sale End
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-body text-lvl-smoke mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={schedule.saleEndDate}
                    onChange={(e) => update({ saleEndDate: e.target.value })}
                    className={cn(INPUT_CLS, saleEndBeforeStart && "ring-1 ring-red-500")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-lvl-smoke mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={schedule.saleEndTime}
                    onChange={(e) => update({ saleEndTime: e.target.value })}
                    className={cn(INPUT_CLS, saleEndBeforeStart && "ring-1 ring-red-500")}
                  />
                </div>
              </div>
              {saleEndBeforeStart && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <p className="text-red-400 text-xs font-body">
                    Sale end must be after sale start
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Visual Timeline ──────────────────────────────────────────────── */}
      {timelineEvents.length > 0 && (
        <div className="bg-lvl-slate/30 rounded-lg p-4">
          <p className="text-xs font-display font-bold tracking-wider text-lvl-smoke uppercase mb-3">
            Scheduled Events
          </p>
          <div className="space-y-3">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("w-3 h-3 rounded-full", event.color)} />
                  {idx < timelineEvents.length - 1 && (
                    <div className="w-px h-6 bg-lvl-slate/50 mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-body text-lvl-white">
                    {event.label}
                  </p>
                  <p className="text-xs font-body text-lvl-smoke">
                    {event.datetime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
