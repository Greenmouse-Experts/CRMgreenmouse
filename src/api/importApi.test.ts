import { describe, expect, it } from "vitest";
import {
  IMPORT_SYNC_MAX_BYTES,
  isTerminalImportStatus,
  parseImportContract,
  parseImportJob,
  parseImportResult,
  resolveImportMode,
  unwrapImportPayload,
} from "./importApi";

describe("import API parsers", () => {
  it("reads entity contracts from an API envelope", () => {
    const contract = parseImportContract(
      {
        data: {
          entity: "contacts",
          headers: ["firstName", "email"],
          fields: [
            {
              name: "firstName",
              label: "First Name",
              required: true,
              type: "string",
            },
            { name: "email", required: "true" },
          ],
          limits: { syncMaxBytes: 1048576, asyncMaxBytes: 52428800 },
          plan: {
            bulkImportAllowed: true,
            reason: null,
            quota: { limited: true, current: 1, max: 500, remaining: 499 },
          },
        },
      },
      "contacts",
    );

    expect(contract.entity).toBe("contacts");
    expect(contract.fields).toEqual([
      { key: "firstName", label: "First Name", required: true, type: "string" },
      { key: "email", label: "Email", required: true },
    ]);
    expect(contract.headers).toEqual(["firstName", "email"]);
    expect(contract.limits.syncMaxBytes).toBe(1048576);
    expect(contract.limits.asyncMaxBytes).toBe(52428800);
    expect(contract.plan).toEqual({
      bulkImportAllowed: true,
      quota: { limited: true, current: 1, max: 500, remaining: 499 },
    });
  });

  it("normalizes sync results and row errors", () => {
    const result = parseImportResult(
      {
        data: {
          message: "Imported with warnings",
          created: 8,
          failed: 2,
          skipped: 1,
          totalRows: 11,
          errors: [
            { row: 3, field: "email", message: "Email is invalid" },
            "Duplicate phone number",
          ],
        },
      },
      "sync",
    );

    expect(result).toMatchObject({
      mode: "sync",
      message: "Imported with warnings",
      imported: 8,
      failed: 2,
      skipped: 1,
      total: 11,
    });
    expect(result.errors).toEqual([
      { row: 3, field: "email", message: "Email is invalid" },
      { message: "Duplicate phone number" },
    ]);
  });

  it("computes async job progress from processed and total rows", () => {
    const job = parseImportJob({
      data: {
        jobId: "job-1",
        status: "running",
        imported: 30,
        failed: 10,
        totalRows: 100,
      },
    });

    expect(job.jobId).toBe("job-1");
    expect(job.processed).toBe(40);
    expect(job.progress).toBe(40);
    expect(isTerminalImportStatus(job.status)).toBe(false);
    expect(isTerminalImportStatus("completed")).toBe(true);
  });

  it("normalizes fractional progress and unwraps nested payloads", () => {
    const job = parseImportJob({
      data: { data: { status: "completed", progress: 0.5 } },
    });

    expect(job.progress).toBe(50);
    expect(unwrapImportPayload({ data: { data: { value: 1 } } })).toEqual({
      value: 1,
    });
  });

  it("routes files above the sync limit to the async endpoint", () => {
    const small = { size: IMPORT_SYNC_MAX_BYTES } as File;
    const large = { size: IMPORT_SYNC_MAX_BYTES + 1 } as File;

    expect(resolveImportMode(small)).toBe("sync");
    expect(resolveImportMode(large)).toBe("async");
    expect(
      resolveImportMode(large, {
        entity: "contacts",
        fields: [],
        headers: [],
        limits: { syncMaxBytes: IMPORT_SYNC_MAX_BYTES * 2 },
        raw: null,
      }),
    ).toBe("sync");
  });
});
