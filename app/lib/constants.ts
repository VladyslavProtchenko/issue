export const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const STATUS_CLASS: Record<string, string> = {
  backlog: 'bg-zinc-200 text-zinc-900 border-transparent',
  todo: 'bg-blue-200 text-zinc-900 border-transparent',
  in_progress: 'bg-amber-200 text-zinc-900 border-transparent',
  done: 'bg-green-200 text-zinc-900 border-transparent',
  cancelled: 'bg-red-200 text-zinc-900 border-transparent',
};

export const PRIORITY_LABEL: Record<string, string> = {
  none: 'None',
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
