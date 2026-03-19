import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAppStore } from "@/stores/app-store";
import {
  buildAnalyticsReport,
  exportAnalyticsReportPdf,
  type AnalyticsRange,
} from "@/services/analytics";
import { useWorkspaceSnapshotQuery } from "@/hooks/use-workspace";
import { formatCurrency } from "@/utils/formatters";

const ranges: { label: string; value: AnalyticsRange }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

export default function AnalyticsScreen() {
  const { colors } = useAppTheme();
  const businessProfile = useAppStore((state) => state.businessProfile);
  const workspaceQuery = useWorkspaceSnapshotQuery();
  const [range, setRange] = useState<AnalyticsRange>("month");
  const workspaceData = workspaceQuery.data;
  const report = useMemo(
    () =>
      buildAnalyticsReport({
        customers: workspaceData?.customers ?? [],
        orders: workspaceData?.orders ?? [],
        products: workspaceData?.products ?? [],
        range,
        businessProfile,
      }),
    [businessProfile, range, workspaceData],
  );
  const maxSales = Math.max(...report.chart.map((point) => point.sales), 1);

  const handleDownload = async () => {
    const result = await exportAnalyticsReportPdf({
      businessProfile,
      report,
    });

    if (!result.shared) {
      Alert.alert(
        "Analytics report ready",
        "The chart PDF was generated on this device.",
      );
    }
  };

  if (workspaceQuery.isPending) {
    return (
      <ScreenShell
        subtitle="Sales, collections, top customers, and product movement in one workspace report."
        title="Analytics"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">Loading analytics...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (workspaceQuery.isError) {
    return (
      <ScreenShell
        subtitle="Sales, collections, top customers, and product movement in one workspace report."
        title="Analytics"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">{workspaceQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      headerAccessory={
        <ThemedButton
          label="Download chart"
          onPress={() => {
            void handleDownload();
          }}
        />
      }
      subtitle="Sales, collections, top customers, and product movement in one workspace report."
      title="Analytics"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <View style={styles.rangeRow}>
          {ranges.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setRange(option.value)}
              style={[
                styles.rangePill,
                {
                  backgroundColor:
                    range === option.value ? colors.primaryMuted : colors.surface,
                  borderColor:
                    range === option.value ? colors.primary : colors.border,
                },
              ]}
            >
              <ThemedText variant="caption">{option.label}</ThemedText>
            </Pressable>
          ))}
        </View>
        <ThemedText variant="subtitle">{report.title}</ThemedText>
        <ThemedText variant="muted">
          Downloadable chart export is live here already. Premium locking can be
          added later without reworking the reporting surface.
        </ThemedText>
      </SurfaceCard>

      <View style={styles.metrics}>
        <MetricCard
          label="Sales"
          tone="brand"
          value={formatCurrency(
            report.totalSales,
            businessProfile?.default_currency ?? "NGN",
          )}
        />
        <MetricCard
          label="Collected"
          tone="success"
          value={formatCurrency(
            report.totalCollected,
            businessProfile?.default_currency ?? "NGN",
          )}
        />
      </View>

      <View style={styles.metrics}>
        <MetricCard
          label="Outstanding"
          tone="warning"
          value={formatCurrency(
            report.outstandingBalance,
            businessProfile?.default_currency ?? "NGN",
          )}
        />
        <MetricCard
          label="Average order"
          value={formatCurrency(
            report.averageOrderValue,
            businessProfile?.default_currency ?? "NGN",
          )}
        />
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Completed" value={`${report.completedOrders}`} />
        <MetricCard
          helper="Customers with more than one order in this range"
          label="Repeat customers"
          value={`${report.repeatCustomers}`}
        />
      </View>

      <SurfaceCard>
        <ThemedText variant="subtitle">Sales chart</ThemedText>
        <View style={styles.chartList}>
          {report.chart.map((point) => (
            <View key={point.label} style={styles.chartRow}>
              <View style={styles.chartLabelColumn}>
                <ThemedText>{point.label}</ThemedText>
                <ThemedText variant="caption">
                  {formatCurrency(
                    point.collected,
                    businessProfile?.default_currency ?? "NGN",
                  )}{" "}
                  collected
                </ThemedText>
              </View>
              <View style={styles.chartTrack}>
                <View
                  style={[
                    styles.chartFill,
                    {
                      width: `${Math.max((point.sales / maxSales) * 100, point.sales > 0 ? 8 : 0)}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.chartMeta}>
                <ThemedText variant="caption">
                  {formatCurrency(
                    point.sales,
                    businessProfile?.default_currency ?? "NGN",
                  )}
                </ThemedText>
                <ThemedText variant="caption">{point.orders} orders</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Top customers</ThemedText>
        <View style={styles.list}>
          {report.topCustomers.length > 0 ? (
            report.topCustomers.map((customer) => (
              <ListRow
                key={customer.id}
                meta={formatCurrency(
                  customer.totalSpend,
                  businessProfile?.default_currency ?? "NGN",
                )}
                subtitle={customer.phone}
                title={customer.fullName}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No customer performance data in this range yet.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Top products</ThemedText>
        <View style={styles.list}>
          {report.topProducts.length > 0 ? (
            report.topProducts.map((product) => (
              <ListRow
                key={product.id}
                meta={`${product.quantity} sold`}
                subtitle={product.category}
                title={product.name}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No product sales data in this range yet.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  rangeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rangePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chartList: {
    gap: 14,
  },
  chartRow: {
    gap: 8,
  },
  chartLabelColumn: {
    gap: 2,
  },
  chartTrack: {
    backgroundColor: "#e5ebdd",
    borderRadius: 999,
    height: 14,
    overflow: "hidden",
  },
  chartFill: {
    backgroundColor: "#6e9d64",
    borderRadius: 999,
    height: "100%",
  },
  chartMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  list: {
    gap: 12,
  },
});
