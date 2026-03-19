import { describe, expect, it } from "vitest";
import {
  APP_CATEGORIES,
  CATEGORY_MAP,
  CATEGORY_META,
  getAppCategory,
  getSubcategory,
} from "@/lib/categories";

describe("CATEGORY_MAP", () => {
  it("maps FOOD_AND_DRINK to food", () => {
    expect(CATEGORY_MAP["FOOD_AND_DRINK"]).toBe("food");
  });

  it("maps TRANSPORTATION to transport", () => {
    expect(CATEGORY_MAP["TRANSPORTATION"]).toBe("transport");
  });

  it("maps ENTERTAINMENT to entertainment", () => {
    expect(CATEGORY_MAP["ENTERTAINMENT"]).toBe("entertainment");
  });

  it("maps GENERAL_MERCHANDISE to shopping", () => {
    expect(CATEGORY_MAP["GENERAL_MERCHANDISE"]).toBe("shopping");
  });

  it("maps RENT_AND_UTILITIES to housing", () => {
    expect(CATEGORY_MAP["RENT_AND_UTILITIES"]).toBe("housing");
  });

  it("maps HOME_IMPROVEMENT to housing", () => {
    expect(CATEGORY_MAP["HOME_IMPROVEMENT"]).toBe("housing");
  });

  it("maps MEDICAL to health", () => {
    expect(CATEGORY_MAP["MEDICAL"]).toBe("health");
  });

  it("maps PERSONAL_CARE to health", () => {
    expect(CATEGORY_MAP["PERSONAL_CARE"]).toBe("health");
  });

  it("maps TRAVEL to travel", () => {
    expect(CATEGORY_MAP["TRAVEL"]).toBe("travel");
  });

  it("maps GENERAL_SERVICES to services", () => {
    expect(CATEGORY_MAP["GENERAL_SERVICES"]).toBe("services");
  });

  it("maps GOVERNMENT_AND_NON_PROFIT to services", () => {
    expect(CATEGORY_MAP["GOVERNMENT_AND_NON_PROFIT"]).toBe("services");
  });

  it("maps INCOME to income", () => {
    expect(CATEGORY_MAP["INCOME"]).toBe("income");
  });

  it("maps TRANSFER_IN to transfers", () => {
    expect(CATEGORY_MAP["TRANSFER_IN"]).toBe("transfers");
  });

  it("maps TRANSFER_OUT to transfers", () => {
    expect(CATEGORY_MAP["TRANSFER_OUT"]).toBe("transfers");
  });

  it("maps LOAN_PAYMENTS to transfers", () => {
    expect(CATEGORY_MAP["LOAN_PAYMENTS"]).toBe("transfers");
  });

  it("maps BANK_FEES to transfers", () => {
    expect(CATEGORY_MAP["BANK_FEES"]).toBe("transfers");
  });
});

describe("getAppCategory", () => {
  it("returns the mapped category for a known primary", () => {
    expect(getAppCategory("FOOD_AND_DRINK")).toBe("food");
  });

  it("returns null for null input", () => {
    expect(getAppCategory(null)).toBeNull();
  });

  it("returns 'services' fallback for unknown primary", () => {
    expect(getAppCategory("SOMETHING_UNKNOWN")).toBe("services");
  });
});

describe("getSubcategory", () => {
  it("extracts subcategory from detailed string", () => {
    expect(getSubcategory("FOOD_AND_DRINK_COFFEE")).toBe("coffee");
  });

  it("extracts multi-word subcategory", () => {
    expect(getSubcategory("FOOD_AND_DRINK_FAST_FOOD")).toBe("fast food");
  });

  it("extracts subcategory for TRANSPORTATION", () => {
    expect(getSubcategory("TRANSPORTATION_PUBLIC_TRANSIT")).toBe("public transit");
  });

  it("returns null for null input", () => {
    expect(getSubcategory(null)).toBeNull();
  });

  it("returns null when no primary prefix matches", () => {
    expect(getSubcategory("UNKNOWN_PREFIX_THING")).toBeNull();
  });
});

describe("CATEGORY_META", () => {
  it("has an entry for every APP_CATEGORIES value", () => {
    for (const category of APP_CATEGORIES) {
      expect(CATEGORY_META[category]).toBeDefined();
      expect(CATEGORY_META[category].label).toBeTruthy();
      expect(CATEGORY_META[category].icon).toBeTruthy();
      expect(CATEGORY_META[category].color).toBeTruthy();
    }
  });

  it("APP_CATEGORIES length matches CATEGORY_META keys", () => {
    expect(APP_CATEGORIES.length).toBe(Object.keys(CATEGORY_META).length);
  });
});
