/**
 * Shared Trading Card Components
 * Consistent styling for price levels across Oracle and Symbol Analyzer
 */

interface PriceLevelProps {
  label: string;
  value: string | number;
  type?: 'entry' | 'stop' | 'target' | 'current' | 'timeframe';
  className?: string;
}

export function PriceLevel({ label, value, type = 'current', className = '' }: PriceLevelProps) {
  const baseClasses = "p-3 rounded bg-white border border-gray-200";
  
  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </div>
      <div className={`${
        type === 'timeframe' 
          ? 'text-lg font-mono text-gray-700' 
          : 'text-lg font-mono font-bold tabular-nums tracking-tight'
      } ${
        type === 'entry' ? 'text-gray-900' :
        type === 'stop' ? 'text-gray-700' :
        type === 'target' ? 'text-gray-800' :
        type === 'current' ? 'text-gray-900' :
        'text-gray-700'
      }`}>
        {value}
      </div>
    </div>
  );
}

interface PriceLevelGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function PriceLevelGrid({ children, columns = 4, className = '' }: PriceLevelGridProps) {
  const colsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }[columns];

  return (
    <div className={`grid grid-cols-2 ${colsClass} gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContainer({ children, className = '' }: CardContainerProps) {
  return (
    <div className={`p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-sm ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  symbol: string;
  badge?: {
    label: string;
    type?: 'bullish' | 'bearish' | 'neutral' | 'high' | 'medium' | 'low';
  };
  children?: React.ReactNode;
}

export function CardHeader({ symbol, badge, children }: CardHeaderProps) {
  const getBadgeColor = (type?: string) => {
    switch (type) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'low':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'bullish':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'bearish':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold font-mono text-gray-900 tracking-tight">{symbol}</h3>
          {badge && (
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded border ${getBadgeColor(badge.type)}`}>
              {badge.label}
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
