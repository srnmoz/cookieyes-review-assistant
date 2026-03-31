import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { IcpSelection, RegularUserSubtype } from '@/lib/types';
import { REGULAR_USER_SUBTYPES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Building2, Users, X } from 'lucide-react';

interface IcpSelectorProps {
  value: IcpSelection;
  onChange: (value: IcpSelection) => void;
}

export function IcpSelector({ value, onChange }: IcpSelectorProps) {
  const [showExclusions, setShowExclusions] = useState(false);

  const handleAgencyToggle = (checked: boolean) => {
    onChange({ ...value, digitalAgencies: checked });
  };

  const handleAllRegularToggle = (checked: boolean) => {
    if (checked) {
      onChange({
        ...value,
        allRegularUsers: true,
        regularUserSubtypes: REGULAR_USER_SUBTYPES.map((s) => s.value),
        excludedSubtypes: [],
      });
    } else {
      onChange({ ...value, allRegularUsers: false, regularUserSubtypes: [], excludedSubtypes: [] });
      setShowExclusions(false);
    }
  };

  const handleSubtypeToggle = (subtype: RegularUserSubtype, checked: boolean) => {
    if (value.allRegularUsers) {
      // When "All" is on, toggling off = exclude
      if (!checked) {
        const excluded = [...value.excludedSubtypes, subtype];
        const remaining = REGULAR_USER_SUBTYPES.filter((s) => !excluded.includes(s.value));
        if (remaining.length === 0) {
          onChange({ ...value, allRegularUsers: false, regularUserSubtypes: [], excludedSubtypes: [] });
        } else {
          onChange({ ...value, excludedSubtypes: excluded });
        }
      } else {
        onChange({ ...value, excludedSubtypes: value.excludedSubtypes.filter((s) => s !== subtype) });
      }
    } else {
      const subtypes = checked
        ? [...value.regularUserSubtypes, subtype]
        : value.regularUserSubtypes.filter((s) => s !== subtype);
      onChange({ ...value, regularUserSubtypes: subtypes });
    }
  };

  const isSubtypeActive = (subtype: RegularUserSubtype) => {
    if (value.allRegularUsers) {
      return !value.excludedSubtypes.includes(subtype);
    }
    return value.regularUserSubtypes.includes(subtype);
  };

  const hasAnySelection = value.digitalAgencies || value.allRegularUsers || value.regularUserSubtypes.length > 0;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-foreground">Target ICP *</Label>

      {/* Agency Group */}
      <div
        className={cn(
          'border rounded-lg p-4 transition-colors cursor-pointer',
          value.digitalAgencies ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
        )}
        onClick={() => handleAgencyToggle(!value.digitalAgencies)}
      >
        <div className="flex items-center gap-3">
          <Checkbox checked={value.digitalAgencies} onCheckedChange={handleAgencyToggle} onClick={(e) => e.stopPropagation()} />
          <Building2 className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Digital Agencies</p>
            <p className="text-xs text-muted-foreground">Agencies, web designers, freelancers managing multiple sites</p>
          </div>
        </div>
      </div>

      {/* Regular Users Group */}
      <div className={cn('border rounded-lg transition-colors', hasAnySelection ? '' : '')}>
        <div
          className={cn(
            'p-4 flex items-center justify-between cursor-pointer rounded-t-lg',
            value.allRegularUsers ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3" onClick={() => handleAllRegularToggle(!value.allRegularUsers)}>
            <Checkbox
              checked={value.allRegularUsers}
              onCheckedChange={handleAllRegularToggle}
              onClick={(e) => e.stopPropagation()}
            />
            <Users className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">All Regular Users</p>
              <p className="text-xs text-muted-foreground">Select all, then exclude specific subtypes if needed</p>
            </div>
          </div>
        </div>

        {/* Exclusion pills when All is selected */}
        {value.allRegularUsers && value.excludedSubtypes.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground">Excluded:</span>
            {value.excludedSubtypes.map((subtype) => (
              <span
                key={subtype}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive cursor-pointer"
                onClick={() => handleSubtypeToggle(subtype, true)}
              >
                {REGULAR_USER_SUBTYPES.find((s) => s.value === subtype)?.label}
                <X className="w-3 h-3" />
              </span>
            ))}
          </div>
        )}

        {/* Individual subtypes */}
        <div className="border-t border-border">
          {REGULAR_USER_SUBTYPES.map((subtype) => (
            <div
              key={subtype.value}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-border last:border-b-0',
                isSubtypeActive(subtype.value) ? 'bg-primary/5' : 'hover:bg-muted/30'
              )}
              onClick={() => handleSubtypeToggle(subtype.value, !isSubtypeActive(subtype.value))}
            >
              <Checkbox
                checked={isSubtypeActive(subtype.value)}
                onCheckedChange={(checked) => handleSubtypeToggle(subtype.value, !!checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-foreground">{subtype.label}</span>
            </div>
          ))}
        </div>
      </div>

      {!hasAnySelection && (
        <p className="text-xs text-destructive">Please select at least one ICP group</p>
      )}
    </div>
  );
}
