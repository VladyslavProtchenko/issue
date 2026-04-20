'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { useLabels } from '@/app/hooks/useLabels';

const STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
];

export interface IssueFiltersValue {
  statuses: string[];
  priorities: string[];
  labelIds: string[];
}

interface IssueFiltersProps {
  value: IssueFiltersValue;
  onChange: (value: IssueFiltersValue) => void;
}

export function IssueFilters({ value, onChange }: IssueFiltersProps) {
  const labels = useLabels();

  const hasFilters = value.statuses.length > 0 || value.priorities.length > 0 || value.labelIds.length > 0;

  function toggleStatus(status: string) {
    const next = value.statuses.includes(status)
      ? value.statuses.filter((s) => s !== status)
      : [...value.statuses, status];
    onChange({ ...value, statuses: next });
  }

  function togglePriority(priority: string) {
    const next = value.priorities.includes(priority)
      ? value.priorities.filter((p) => p !== priority)
      : [...value.priorities, priority];
    onChange({ ...value, priorities: next });
  }

  function toggleLabel(labelId: string) {
    const next = value.labelIds.includes(labelId)
      ? value.labelIds.filter((l) => l !== labelId)
      : [...value.labelIds, labelId];
    onChange({ ...value, labelIds: next });
  }

  function clearAll() {
    onChange({ statuses: [], priorities: [], labelIds: [] });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[140px] justify-between">
            <span className="flex items-center gap-2">
              Status
              {value.statuses.length > 0 && (
                <Badge className="h-5 px-1.5 text-xs">{value.statuses.length}</Badge>
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          {STATUSES.map((s) => (
            <DropdownMenuCheckboxItem
              key={s.value}
              checked={value.statuses.includes(s.value)}
              onCheckedChange={() => toggleStatus(s.value)}
              onSelect={(e) => e.preventDefault()}
            >
              {s.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[140px] justify-between">
            <span className="flex items-center gap-2">
              Priority
              {value.priorities.length > 0 && (
                <Badge className="h-5 px-1.5 text-xs">{value.priorities.length}</Badge>
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          {PRIORITIES.map((p) => (
            <DropdownMenuCheckboxItem
              key={p.value}
              checked={value.priorities.includes(p.value)}
              onCheckedChange={() => togglePriority(p.value)}
              onSelect={(e) => e.preventDefault()}
            >
              {p.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {labels.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-between">
              <span className="flex items-center gap-2">
                Label
                {value.labelIds.length > 0 && (
                  <Badge className="h-5 px-1.5 text-xs">{value.labelIds.length}</Badge>
                )}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            {labels.map((l) => (
              <DropdownMenuCheckboxItem
                key={l.id}
                checked={value.labelIds.includes(l.id)}
                onCheckedChange={() => toggleLabel(l.id)}
                onSelect={(e) => e.preventDefault()}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.name}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-muted-foreground">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
