import React from 'react';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertBannerProps {
  type: 'warning' | 'info' | 'success' | 'error';
  condition?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  condition = true,
  dismissible = true,
  onDismiss,
  icon,
  children,
  className
}) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (!condition || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const typeStyles = {
    warning: 'bg-orange-50 border-orange-500 text-orange-900',
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900'
  };

  const defaultIcons = {
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border-l-4',
        typeStyles[type],
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icon || defaultIcons[type]}
      </div>
      <div className="flex-1 text-sm leading-relaxed">
        {children}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;