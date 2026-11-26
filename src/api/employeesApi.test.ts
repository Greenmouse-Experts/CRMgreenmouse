import { describe, expect, it } from "vitest";
import {
  findMatchingBank,
  sanitizeEmployeePayload,
  validateEmployeeBankingGroup,
  type BankOption,
} from "./employeesApi";

const SAMPLE_BANKS: BankOption[] = [
  { name: "Access Bank", code: "044" },
  { name: "Access Bank (Diamond)", code: "063" },
  { name: "PalmPay", code: "999991" },
  { name: "Zenith Bank", code: "057" },
];

describe("sanitizeEmployeePayload", () => {
  it("preserves roleId and bankCode when provided and strips empty optional fields", () => {
    const result = sanitizeEmployeePayload({
      roleId: "00000000-0000-4000-8000-000000000001",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      bankName: "Access Bank",
      bankCode: "044",
      bankAccountNumber: "0123456789",
      middleName: "",
      managerId: undefined,
    });

    expect(result).toEqual({
      roleId: "00000000-0000-4000-8000-000000000001",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      bankName: "Access Bank",
      bankCode: "044",
      bankAccountNumber: "0123456789",
    });
  });

  it("strips empty roleId and bankCode so optional UUID/code validation does not fail", () => {
    const result = sanitizeEmployeePayload({
      roleId: "",
      bankCode: "",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });

    expect(result).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });
  });
});

describe("findMatchingBank", () => {
  it("matches by code or exact/legacy bank name", () => {
    expect(findMatchingBank(SAMPLE_BANKS, "999991")).toEqual({
      name: "PalmPay",
      code: "999991",
    });
    expect(findMatchingBank(SAMPLE_BANKS, undefined, "access bank")).toEqual({
      name: "Access Bank",
      code: "044",
    });
    expect(findMatchingBank(SAMPLE_BANKS, undefined, "Access")).toEqual({
      name: "Access Bank",
      code: "044",
    });
    expect(findMatchingBank(SAMPLE_BANKS, undefined, "Zenith")).toEqual({
      name: "Zenith Bank",
      code: "057",
    });
  });
});

describe("validateEmployeeBankingGroup", () => {
  it("allows omitting all banking fields", () => {
    expect(
      validateEmployeeBankingGroup({
        firstName: "Ada",
        lastName: "Lovelace",
      }),
    ).toBeNull();
  });

  it("rejects partial banking details that would trigger backend 400", () => {
    expect(
      validateEmployeeBankingGroup({
        firstName: "Ada",
        lastName: "Lovelace",
        bankCode: "044",
      }),
    ).toBeTruthy();
    expect(
      validateEmployeeBankingGroup({
        firstName: "Ada",
        lastName: "Lovelace",
        bankName: "Access",
        bankAccountNumber: "0123456789",
      }),
    ).toBeTruthy();
    expect(
      validateEmployeeBankingGroup({
        firstName: "",
        lastName: "Lovelace",
        bankCode: "044",
        bankAccountNumber: "0123456789",
      }),
    ).toBeTruthy();
  });

  it("passes when all four required fields are present", () => {
    expect(
      validateEmployeeBankingGroup({
        firstName: "Ada",
        lastName: "Lovelace",
        bankName: "Access Bank",
        bankCode: "044",
        bankAccountNumber: "0123456789",
      }),
    ).toBeNull();
  });
});
