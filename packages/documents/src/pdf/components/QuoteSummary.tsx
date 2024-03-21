import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Company, Customer } from "../../types";

type SummaryProps = {
  company: Company;
  customer: Customer;
  items: {
    label: string;
    value?: string | null;
  }[];
};

const styles = StyleSheet.create({
  summary: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  companyDetails: {
    display: "flex",
    flexDirection: "column",
    rowGap: 3,
    fontSize: 11,
    fontWeight: 500,
    width: "68%",
  },
  companyName: {
    fontSize: 13,
    letterSpacing: -0.5,
    color: "#000000",
    fontWeight: 700,
  },
  documentSummary: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    rowGap: 3,
    fontSize: 11,
    fontWeight: 500,
    width: "32%",
  },
  documentSummaryItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginBottom: 5,
  },
  documentSummaryLabel: {
    color: "#7d7d7d",
    // fontWeight: 700,
    width: "30%",
  },
  documentSummaryValue: {
    fontWeight: 500,
  },
});

const QuoteSummary = ({ company, customer, items }: SummaryProps) => {
  return (
    <View style={styles.summary}>
      <View style={styles.companyDetails}>
        <Text style={styles.documentSummaryLabel}>From</Text>
        <Text style={styles.companyName}>{company.name}</Text>
        {company.addressLine1 && <Text>{company.addressLine1}</Text>}
        {company.addressLine2 && <Text>{company.addressLine2}</Text>}
        {company.city && company.state && company.postalCode && (
          <Text>{`${company.city}, ${company.state}, ${company.postalCode}`}</Text>
        )}
        {company.phone && <Text>{company.phone}</Text>}
        {company.email && <Text>{company.email}</Text>}
      </View>
      <View style={styles.companyDetails}>
        <Text style={styles.documentSummaryLabel}>To</Text>
        <Text style={styles.companyName}>{customer.name}</Text>
      </View>
      <View style={styles.documentSummary}>
        {items.map((item) => (
          <View key={item.label} style={styles.documentSummaryItem}>
            {item.label !== "" ? (
              <Text style={styles.documentSummaryLabel}>{item.label}:</Text>
            ) : null}
            {item.value ? (
              <Text style={styles.documentSummaryValue}>{item.value}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

export default QuoteSummary;
