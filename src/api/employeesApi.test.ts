import { describe, expect, it } from "vitest";
import { sanitizeEmployeePayload } from "./employeesApi";

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
