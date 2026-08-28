import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import type {
  BuildingBill,
  UnitBillItem,
  FundBillItem,
} from "../types/billing.types";

// ============================================
// Font Registration (برای پشتیبانی از فارسی)
// ============================================

// ثبت فونت فارسی - از فایل‌های محلی استفاده می‌کنیم
// برای این کار باید فونت رو در public/fonts قرار بدی
Font.register({
  family: "Vazir",
  src: "/fonts/Vazirmatn-VariableFont_wght.ttf",
});

Font.register({
  family: "Vazir-Bold",
  src: "/fonts/Vazirmatn-Bold.ttf",
});

// ============================================
// Helper Functions
// ============================================

function getStatusStyle(status: string) {
  if (status === "بدهکار") {
    return { color: "#dc2626", fontWeight: "bold" };
  }
  if (status === "بستانکار") {
    return { color: "#16a34a", fontWeight: "bold" };
  }
  return { color: "#6b7280" };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Vazir",
    direction: "rtl",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1px solid #ccc",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginBottom: 5,
  },
  date: {
    fontSize: 10,
    textAlign: "center",
    color: "#999",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  table: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
    paddingVertical: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "2px solid #333",
    paddingVertical: 5,
    backgroundColor: "#e0e0e0",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    paddingHorizontal: 4,
    textAlign: "center",
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
    textAlign: "center",
  },
  unitCard: {
    marginBottom: 10,
    border: "1px solid #ddd",
    borderRadius: 5,
    padding: 10,
  },
  unitTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  summaryItem: {
    width: "33%",
    padding: 5,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#666",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  summaryValueDebtor: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#dc2626",
  },
  summaryValueCreditor: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#16a34a",
  },
  summaryValueSettled: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6b7280",
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1px solid #ccc",
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
  rowEven: {
    backgroundColor: "#f9f9f9",
  },
  rowOdd: {
    backgroundColor: "#ffffff",
  },
});

// ============================================
// Types
// ============================================

interface PDFBillsProps {
  mode: "sakhteman" | "vahed" | "sandogh";
  buildingName: string;
  buildingBills: BuildingBill[];
  unitBills: UnitBillItem[];
  fundBills: FundBillItem[];
  dateStart?: string;
  dateEnd?: string;
  detailPerson?: string;
  detailCostPay?: string;
  managerFilter?: string;
  unitFilter?: string;
  selectedUnitName?: string;
}

// ============================================
// Main PDF Document
// ============================================

export function PDFBillsDocument(props: PDFBillsProps) {
  const {
    mode,
    buildingName,
    buildingBills,
    unitBills,
    fundBills,
    dateStart,
    dateEnd,
    detailPerson,
    detailCostPay,
    managerFilter,
    unitFilter,
    selectedUnitName,
  } = props;

  const getReportTitle = () => {
    let title = "";
    if (mode === "sakhteman") {
      title = "گزارش تجمیعی";
      if (managerFilter === "debtor") title += " - بدهکاران";
      if (unitFilter === "one" && selectedUnitName) {
        title += ` - واحد ${selectedUnitName}`;
      }
    } else if (mode === "vahed") {
      title = "گزارش جزئیات";
      if (detailPerson === "malek") title += " - مالک";
      if (detailPerson === "saken") title += " - ساکن";
      if (detailCostPay === "cost") title += " - هزینه‌ها";
      if (detailCostPay === "pay") title += " - پرداختی‌ها";
      if (unitFilter === "one" && selectedUnitName) {
        title += ` - واحد ${selectedUnitName}`;
      }
    } else if (mode === "sandogh") {
      title = "گزارش صندوق";
    }
    return title;
  };

  const getDateRange = () => {
    if (dateStart && dateEnd) {
      return `از ${dateStart} تا ${dateEnd}`;
    }
    return "";
  };

  const now = new Date();
  const persianDate = `${now.getFullYear() - 621}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>صورت حساب ساختمان</Text>
          <Text style={styles.subtitle}>{buildingName}</Text>
          <Text style={styles.subtitle}>{getReportTitle()}</Text>
          {getDateRange() && (
            <Text style={styles.date}>بازه زمانی: {getDateRange()}</Text>
          )}
          <Text style={styles.date}>تاریخ تهیه: {persianDate}</Text>
        </View>

        {/* Content */}
        {mode === "sakhteman" && (
          <BuildingBillContent buildingBills={buildingBills} />
        )}

        {mode === "vahed" && (
          <UnitBillContent unitBills={unitBills} />
        )}

        {mode === "sandogh" && (
          <FundBillContent fundBills={fundBills} />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>اپلیکیشن مدیریت ساختمان</Text>
          <Text>www.sakhtemanet.ir</Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================
// BuildingBillContent Component
// ============================================

function BuildingBillContent({ buildingBills }: { buildingBills: BuildingBill[] }) {
  if (buildingBills.length === 0) {
    return <Text>هیچ داده‌ای برای نمایش وجود ندارد.</Text>;
  }

  return (
    <>
      <Text style={styles.sectionTitle}>لیست تجمیعی واحدها</Text>

      {buildingBills.map((bill, index) => {
        const ownerStatusStyle = getStatusStyle(bill.ownerStatus);
        const residentStatusStyle = getStatusStyle(bill.residentStatus);

        return (
          <View key={bill.unitId} style={styles.unitCard}>
            <Text style={styles.unitTitle}>واحد {bill.unitName}</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>جمع پرداختی مالک</Text>
                <Text style={styles.summaryValue}>{bill.sumPayOwner}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>جمع هزینه مالک</Text>
                <Text style={styles.summaryValue}>{bill.sumCostOwner}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>وضعیت مالک</Text>
                <Text style={[styles.summaryValue, ownerStatusStyle]}>
                  {bill.balanceOwner} {bill.ownerStatus}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>جمع پرداختی ساکن</Text>
                <Text style={styles.summaryValue}>{bill.sumPayResident}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>جمع هزینه ساکن</Text>
                <Text style={styles.summaryValue}>{bill.sumCostResident}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>وضعیت ساکن</Text>
                <Text style={[styles.summaryValue, residentStatusStyle]}>
                  {bill.balanceResident} {bill.residentStatus}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </>
  );
}

// ============================================
// UnitBillContent Component
// ============================================

function UnitBillContent({ unitBills }: { unitBills: UnitBillItem[] }) {
  if (unitBills.length === 0) {
    return <Text>هیچ داده‌ای برای نمایش وجود ندارد.</Text>;
  }

  return (
    <>
      {/* حذف بخش خلاصه وضعیت */}
      
      {/* فقط جزئیات */}
      <Text style={styles.sectionTitle}>جزئیات صورت حساب</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, { flex: 2 }]}>عنوان</Text>
          <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>واحد</Text>
          <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>نوع</Text>
          <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>پرداخت‌کننده</Text>
          <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>تاریخ</Text>
          <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>مبلغ</Text>
        </View>

        {unitBills.map((item, index) => (
          <View
            key={`${item.unitId}-${index}`}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.rowEven : styles.rowOdd,
            ]}
          >
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.title}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.unitName}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.type}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.person}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.dateFrom}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.price}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

// ============================================
// FundBillContent Component
// ============================================

function FundBillContent({ fundBills }: { fundBills: FundBillItem[] }) {
  if (fundBills.length === 0) {
    return <Text>هیچ داده‌ای برای نمایش وجود ندارد.</Text>;
  }

  const total = fundBills.reduce(
    (sum, item) => sum + parseInt(item.price.replace(/,/g, "") || "0"),
    0
  );

  return (
    <>
      <Text style={styles.sectionTitle}>گردش صندوق</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, { flex: 3 }]}>عنوان</Text>
          <Text style={[styles.tableCellHeader, { flex: 2 }]}>تاریخ شروع</Text>
          <Text style={[styles.tableCellHeader, { flex: 2 }]}>تاریخ پایان</Text>
          <Text style={[styles.tableCellHeader, { flex: 2 }]}>مبلغ</Text>
        </View>

        {fundBills.map((item, index) => (
          <View
            key={`${item.title}-${index}`}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.rowEven : styles.rowOdd,
            ]}
          >
            <Text style={[styles.tableCell, { flex: 3 }]}>{item.title}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.dateStart}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.dateEnd}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.price}</Text>
          </View>
        ))}

        {/* Total Row */}
        <View
          style={[
            styles.tableRow,
            {
              borderTop: "2px solid #333",
              backgroundColor: "#e0e0e0",
            },
          ]}
        >
          <Text style={[styles.tableCell, { flex: 7, fontWeight: "bold" }]}>
            جمع کل
          </Text>
          <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
            {formatPrice(total)}
          </Text>
        </View>
      </View>
    </>
  );
}