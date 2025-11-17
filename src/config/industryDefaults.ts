export type IndustryDefaults = Record<string, any>;

export const DEFAULT_INDUSTRY_FIELDS: Record<string, IndustryDefaults> = {
  retail: {
    warrantyPeriod: 12,
    returnPolicy: 30,
    serialNumber: false
  },
  pharmacy: {
    expiryDate: '',
    batchNumber: '',
    prescriptionRequired: false,
    temperatureControl: false,
    supplierLicense: ''
  },
  restaurant: {
    expiryDate: '',
    allergenInfo: '',
    storageTemp: 'Ambient',
    preparationTime: 0
  },
  wholesale: {
    minimumOrder: 1,
    bulkPricing: true,
    leadTime: 7
  },
  services: {
    serviceDuration: 1,
    qualifiedStaff: false,
    recurringBilling: false
  },
  manufacturing: {
    productionTime: 1,
    rawMaterials: true,
    qualityCheck: true
  }
};

export function getMergedIndustryDefaults(industry: string): IndustryDefaults {
  const base: IndustryDefaults = (DEFAULT_INDUSTRY_FIELDS as any)[industry] ?? {};
  let overrides: IndustryDefaults = {};
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('industryDefaultsSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        overrides = parsed[industry] ?? {};
      }
    }
  } catch {
    // ignore parsing errors
  }
  return { ...base, ...overrides };
}

export function setIndustryDefaultsOverride(industry: string, values: IndustryDefaults) {
  try {
    if (typeof window !== 'undefined') {
      const currentRaw = localStorage.getItem('industryDefaultsSettings');
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      current[industry] = values;
      localStorage.setItem('industryDefaultsSettings', JSON.stringify(current));
    }
  } catch {
    // ignore
  }
}
