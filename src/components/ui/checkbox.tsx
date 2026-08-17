import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
}

// Radix未導入のため依存追加を避け、nativeのinput[type=checkbox]をスタイリングして代用する。
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, indeterminate, ...props }, forwardedRef) => {
  const innerRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement);

  React.useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={innerRef}
      className={cn(
        'h-4 w-4 shrink-0 rounded border-[#D0D5DD] text-primary outline-none transition-colors accent-[#3157E5] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
