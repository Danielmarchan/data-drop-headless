import { useMemo, useState, type ReactNode } from 'react';
import { AgCharts } from 'ag-charts-react';
import {
  type AgCartesianChartOptions,
  type AgPolarChartOptions,
} from 'ag-charts-community';
import {
  type UploadRowDto,
  type ViewerUploadDetailDto,
} from '@data-drop/api-schema';

const TOKENS = {
  primary: '#004596',
  primaryAccent: '#005cc3',
  primaryMuted: '#adc7ff',
  positive: '#005152',
  error: '#ba1a1a',
  neutralMuted: '#545f72',
  surfaceHigh: '#e3e8f9',
  surfaceLowest: '#ffffff',
  onSurface: '#161c27',
  onSurfaceVariant: '#424752',
} as const;

type Bucket = 'day' | 'week' | 'month';

function readString(row: UploadRowDto, key: string): string | undefined {
  const v = row.data[key];
  if (typeof v === 'string' && v.length > 0) return v;
  if (typeof v === 'number') return String(v);
  return undefined;
}

function readNumber(row: UploadRowDto, key: string): number | undefined {
  const v = row.data[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.length > 0) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function readDate(row: UploadRowDto, key: string): Date | undefined {
  const s = readString(row, key);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function bucketKey(date: Date, bucket: Bucket): { sort: string; label: string } {
  if (bucket === 'day') {
    const iso = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return { sort: iso, label };
  }
  if (bucket === 'month') {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    return { sort: `${y}-${m}`, label };
  }
  const wk = isoWeek(date);
  return {
    sort: `${date.getUTCFullYear()}-${String(wk).padStart(2, '0')}`,
    label: `WK ${String(wk).padStart(2, '0')}`,
  };
}

type BucketPoint = { bucket: string; count: number; fill: string };

function ordersByBucket(rows: UploadRowDto[], bucket: Bucket): BucketPoint[] {
  const seen = new Map<string, { label: string; orderIds: Set<string> }>();
  for (const row of rows) {
    const date = readDate(row, 'created_at');
    const orderId = readString(row, 'order_id');
    if (!date || !orderId) continue;
    const { sort, label } = bucketKey(date, bucket);
    let entry = seen.get(sort);
    if (!entry) {
      entry = { label, orderIds: new Set() };
      seen.set(sort, entry);
    }
    entry.orderIds.add(orderId);
  }
  const sorted = [...seen.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const counts = sorted.map(([, e]) => e.orderIds.size);
  const max = counts.reduce((m, c) => (c > m ? c : m), 0);
  return sorted.map(([, e]) => ({
    bucket: e.label,
    count: e.orderIds.size,
    fill: e.orderIds.size === max && max > 0 ? TOKENS.primary : TOKENS.primaryMuted,
  }));
}

type StatusPoint = {
  status: string;
  statusKey: string;
  count: number;
  percent: number;
  color: string;
};

function statusBreakdown(
  rows: UploadRowDto[],
  key: string,
  palette: Record<string, string>,
  fallback: string,
): StatusPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const s = readString(row, key)?.toLowerCase();
    if (!s) continue;
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([statusKey, count]) => ({
      status: statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
      statusKey,
      count,
      percent: total > 0 ? count / total : 0,
      color: palette[statusKey] ?? fallback,
    }));
}

type LineTotalMetric = 'average' | 'median';

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function lineTotalByQuantity(
  rows: UploadRowDto[],
  metric: LineTotalMetric,
): { quantity: number; quantityLabel: string; value: number }[] {
  const grouped = new Map<number, number[]>();
  for (const row of rows) {
    const quantity = readNumber(row, 'quantity');
    const lineTotal = readNumber(row, 'line_total');
    if (quantity === undefined || lineTotal === undefined) continue;
    const bucket = grouped.get(quantity);
    if (bucket) {
      bucket.push(lineTotal);
    } else {
      grouped.set(quantity, [lineTotal]);
    }
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([quantity, values]) => ({
      quantity,
      quantityLabel: String(quantity),
      value:
        metric === 'median'
          ? median(values)
          : values.reduce((sum, current) => sum + current, 0) / values.length,
    }));
}

function summaryStats(rows: UploadRowDto[]) {
  let totalRevenue = 0;
  const orderTotals = new Map<string, number>();
  let mostRecent: Date | undefined;
  for (const row of rows) {
    const lineTotal = readNumber(row, 'line_total');
    if (lineTotal !== undefined) totalRevenue += lineTotal;
    const orderId = readString(row, 'order_id');
    const orderTotal = readNumber(row, 'total_price');
    if (orderId && orderTotal !== undefined && !orderTotals.has(orderId)) {
      orderTotals.set(orderId, orderTotal);
    }
    const date = readDate(row, 'created_at');
    if (date && (!mostRecent || date > mostRecent)) mostRecent = date;
  }
  const orderCount = orderTotals.size;
  const orderSum = [...orderTotals.values()].reduce((a, b) => a + b, 0);
  return {
    totalRevenue,
    avgOrderValue: orderCount > 0 ? orderSum / orderCount : 0,
    totalRecords: rows.length,
    mostRecentOrder: mostRecent,
  };
}

function ChartCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg bg-surface-lowest p-6 shadow-ghost ${className}`}>{children}</div>
  );
}

function ChartHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h3 className="font-manrope text-xl font-bold tracking-tight text-on-surface">{title}</h3>
        {subtitle ? (
          <p className="mt-1 font-inter text-sm text-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ label = 'No data available.' }: { label?: string }) {
  return (
    <div className="flex h-56 items-center justify-center">
      <p className="font-inter text-sm text-on-surface-variant">{label}</p>
    </div>
  );
}

function OrdersTrendChart({ rows }: { rows: UploadRowDto[] }) {
  const [bucket, setBucket] = useState<Bucket>('week');
  const data = useMemo(() => ordersByBucket(rows, bucket), [rows, bucket]);

  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data,
      series: [
        {
          type: 'bar',
          xKey: 'bucket',
          yKey: 'count',
          yName: 'Orders',
          cornerRadius: 4,
          itemStyler: ({ datum }) => ({
            fill: (datum as BucketPoint).fill,
          }),
          label: {
            enabled: true,
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: TOKENS.onSurface,
            formatter: ({ value }) => String(value),
          },
        },
      ],
      axes: {
        x: {
          type: 'category',
          position: 'bottom',
          label: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            color: TOKENS.onSurfaceVariant,
            fontWeight: 'bold',
          },
          line: { enabled: false },
          tick: { size: 0 },
        },
        y: {
          type: 'number',
          position: 'left',
          label: { enabled: false },
          gridLine: { enabled: false },
          line: { enabled: false },
          tick: { size: 0 },
        },
      },
      background: { fill: TOKENS.surfaceLowest },
      padding: { top: 24, right: 8, bottom: 8, left: 8 },
    }),
    [data],
  );

  const toggles: Array<{ key: Bucket; label: string }> = [
    { key: 'day', label: 'Daily' },
    { key: 'week', label: 'Weekly' },
    { key: 'month', label: 'Monthly' },
  ];

  return (
    <ChartCard>
      <ChartHeader
        title="Orders Trend"
        subtitle="Daily volume for the selected period"
        action={
          <div className="flex rounded-md bg-surface-low p-1">
            {toggles.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setBucket(t.key)}
                className={`rounded-sm px-3 py-1 font-inter text-xs font-semibold transition ${
                  bucket === t.key
                    ? 'bg-surface-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-72">
          <AgCharts options={options} />
        </div>
      )}
    </ChartCard>
  );
}

const FINANCIAL_PALETTE: Record<string, string> = {
  paid: TOKENS.primary,
  refunded: TOKENS.positive,
  cancelled: TOKENS.error,
};

function FinancialStatusDonut({ rows }: { rows: UploadRowDto[] }) {
  const data = useMemo(
    () => statusBreakdown(rows, 'financial_status', FINANCIAL_PALETTE, TOKENS.neutralMuted),
    [rows],
  );
  const paid = data.find((d) => d.statusKey === 'paid');

  const options = useMemo<AgPolarChartOptions>(
    () => ({
      data,
      series: [
        {
          type: 'donut',
          angleKey: 'count',
          calloutLabelKey: 'status',
          innerRadiusRatio: 0.72,
          fills: data.map((d) => d.color),
          strokes: data.map(() => TOKENS.surfaceLowest),
          strokeWidth: 2,
          calloutLabel: { enabled: false },
          sectorLabel: { enabled: false },
          innerLabels: paid
            ? [
                {
                  text: `${Math.round(paid.percent * 100)}%`,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  color: TOKENS.onSurface,
                },
                {
                  text: 'Paid',
                  fontSize: 11,
                  fontFamily: 'Inter, sans-serif',
                  color: TOKENS.onSurfaceVariant,
                  spacing: 6,
                },
              ]
            : [],
        },
      ],
      background: { fill: TOKENS.surfaceLowest },
      legend: { enabled: false },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
    }),
    [data, paid],
  );

  return (
    <ChartCard>
      <ChartHeader title="Financial Status" />
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="h-44 flex justify-center">
            <AgCharts options={options} />
          </div>
          <ul className="mt-6 flex flex-col gap-3">
            {data.map((d) => (
              <li
                key={d.statusKey}
                className="flex items-center justify-between font-inter text-sm"
              >
                <span className="flex items-center gap-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="font-medium text-on-surface">{d.status}</span>
                </span>
                <span className="font-bold text-on-surface">{d.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartCard>
  );
}

const FULFILLMENT_PALETTE: Record<string, string> = {
  fulfilled: TOKENS.primaryAccent,
  pending: TOKENS.neutralMuted,
  unfulfilled: TOKENS.surfaceHigh,
};

function FulfillmentStatusPie({ rows }: { rows: UploadRowDto[] }) {
  const data = useMemo(
    () => statusBreakdown(rows, 'fulfillment_status', FULFILLMENT_PALETTE, TOKENS.neutralMuted),
    [rows],
  );

  const options = useMemo<AgPolarChartOptions>(
    () => ({
      data,
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          calloutLabelKey: 'status',
          fills: data.map((d) => d.color),
          strokes: data.map(() => TOKENS.surfaceLowest),
          strokeWidth: 2,
          calloutLabel: { enabled: false },
          sectorLabel: { enabled: false },
        },
      ],
      background: { fill: TOKENS.surfaceLowest },
      legend: { enabled: false },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
    }),
    [data],
  );

  return (
    <ChartCard>
      <ChartHeader title="Fulfillment Status" />
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="h-56 flex">
            <AgCharts options={options} />
          </div>
          <ul className="mt-6 flex items-center gap-2 flex-wrap">
            {data.map((d) => (
              <li
                key={d.statusKey}
                className="flex items-center gap-2 rounded-full bg-surface-low px-3 py-1.5"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="font-inter text-xs font-bold text-on-surface">
                  {d.status} ({Math.round(d.percent * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartCard>
  );
}

function LineTotalByQuantityChart({ rows }: { rows: UploadRowDto[] }) {
  const [metric, setMetric] = useState<LineTotalMetric>('average');
  const data = useMemo(() => lineTotalByQuantity(rows, metric), [rows, metric]);
  const metricLabel = metric === 'average' ? 'Average' : 'Median';

  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data,
      series: [
        {
          type: 'line',
          xKey: 'quantityLabel',
          xName: 'Quantity',
          yKey: 'value',
          yName: `${metricLabel} Line Total`,
          stroke: TOKENS.primary,
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: TOKENS.primary,
            stroke: TOKENS.surfaceLowest,
            strokeWidth: 2,
            size: 10,
          },
        },
      ],
      axes: {
        x: {
          type: 'category',
          position: 'bottom',
          title: {
            enabled: true,
            text: 'Quantity',
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            color: TOKENS.onSurfaceVariant,
            fontWeight: 'bold',
          },
          label: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            color: TOKENS.onSurfaceVariant,
          },
          gridLine: { enabled: false },
        },
        y: {
          type: 'number',
          position: 'left',
          title: {
            enabled: true,
            text: `${metricLabel} Line Total ($)`,
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            color: TOKENS.onSurfaceVariant,
            fontWeight: 'bold',
          },
          label: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            color: TOKENS.onSurfaceVariant,
            formatter: ({ value }) => `$${Number(value).toLocaleString()}`,
          },
          gridLine: {
            enabled: true,
            style: [{ stroke: TOKENS.surfaceHigh, lineDash: [] }],
          },
        },
      },
      background: { fill: TOKENS.surfaceLowest },
      legend: { enabled: false },
      padding: { top: 8, right: 16, bottom: 8, left: 8 },
    }),
    [data, metricLabel],
  );

  return (
    <ChartCard>
      <ChartHeader
        title="Line Total by Quantity"
        subtitle={`${metricLabel} line total for each quantity bucket`}
        action={
          <div className="flex rounded-md bg-surface-low p-1">
            {(['average', 'median'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                className={`rounded-sm px-3 py-1 font-inter text-xs font-semibold transition ${
                  metric === key
                    ? 'bg-surface-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {key === 'average' ? 'Average' : 'Median'}
              </button>
            ))}
          </div>
        }
      />
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-72">
          <AgCharts options={options} />
        </div>
      )}
    </ChartCard>
  );
}

function StatCard({
  label,
  value,
  trend,
  trendTone = 'muted',
}: {
  label: string;
  value: string;
  trend?: string;
  trendTone?: 'positive' | 'primary' | 'muted';
}) {
  const trendClass =
    trendTone === 'positive'
      ? 'text-positive'
      : trendTone === 'primary'
        ? 'text-primary'
        : 'text-on-surface-variant';
  return (
    <div className="rounded-lg bg-surface-lowest p-6 shadow-ghost">
      <p className="font-inter text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 font-inter text-2xl font-extrabold text-on-surface">{value}</p>
      {trend ? <p className={`mt-2 font-inter text-xs font-bold ${trendClass}`}>{trend}</p> : null}
    </div>
  );
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export default function EcommerceStorePerformance({
  data,
}: {
  data: ViewerUploadDetailDto;
}) {
  const rows = data.rows;
  const stats = useMemo(() => summaryStats(rows), [rows]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OrdersTrendChart rows={rows} />
        </div>
        <FinancialStatusDonut rows={rows} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FulfillmentStatusPie rows={rows} />
        <div className="lg:col-span-2">
          <LineTotalByQuantityChart rows={rows} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={currencyFormatter.format(stats.totalRevenue)}
          trend="Sum of line totals"
          trendTone="positive"
        />
        <StatCard
          label="Avg Order Value"
          value={currencyFormatter.format(stats.avgOrderValue)}
          trend="Per unique order"
          trendTone="primary"
        />
        <StatCard
          label="Total Records"
          value={stats.totalRecords.toLocaleString()}
          trend="Verified integrity"
          trendTone="positive"
        />
        <StatCard
          label="Most Recent Order"
          value={stats.mostRecentOrder ? dateFormatter.format(stats.mostRecentOrder) : '—'}
        />
      </div>
    </div>
  );
}
