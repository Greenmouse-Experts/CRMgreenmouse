import { describe, expect, it } from "vitest";
import {
  normalizeKanbanColumns,
  normalizePipeline,
  normalizePipelineDeal,
  normalizePipelineStage,
  reorderStageIds,
  unwrapList,
} from "./pipelineApi";

describe("pipelineApi helpers", () => {
  it("unwraps pipeline lists from direct and wrapped envelopes", () => {
    expect(unwrapList([{ id: "p-1" }])).toEqual([{ id: "p-1" }]);
    expect(unwrapList({ data: [{ id: "p-2" }] })).toEqual([{ id: "p-2" }]);
    expect(unwrapList({ data: { pipelines: [{ id: "p-3" }] } })).toEqual([
      { id: "p-3" },
    ]);
  });

  it("normalizes pipelines and sorts stages by order/position", () => {
    const pipeline = normalizePipeline({
      id: "pipe-1",
      name: "Enterprise Sales",
      description: "High-value enterprise deals",
      isActive: true,
      stages: [
        { id: "s-2", name: "Proposal Sent", order: 2, color: "#F59E0B" },
        { id: "s-1", name: "Qualified", order: 1, color: "#3B82F6" },
        { id: "s-3", name: "Closed Won", order: 3, isWon: true },
      ],
    });

    expect(pipeline.id).toBe("pipe-1");
    expect(pipeline.name).toBe("Enterprise Sales");
    expect(pipeline.isActive).toBe(true);
    expect(pipeline.stages.map((s) => s.id)).toEqual(["s-1", "s-2", "s-3"]);
    expect(pipeline.stages[2].isWon).toBe(true);
    expect(pipeline.stages[2].color).toBe("#3B82F6");
  });

  it("normalizes stage defaults and deal shapes", () => {
    const stage = normalizePipelineStage({ id: "st-1", name: "Discovery" }, 0);
    expect(stage).toMatchObject({
      id: "st-1",
      name: "Discovery",
      color: "#3B82F6",
      order: 0,
      isWon: false,
      isLost: false,
    });

    const deal = normalizePipelineDeal({
      id: "deal-1",
      name: "Acme Q4 Deal",
      pipelineId: "pipe-1",
      stageId: "st-1",
      value: "50000",
      currency: "NGN",
      status: "OPEN",
    });
    expect(deal).toMatchObject({
      id: "deal-1",
      name: "Acme Q4 Deal",
      pipelineId: "pipe-1",
      stageId: "st-1",
      value: 50000,
      currency: "NGN",
      status: "open",
    });
  });

  it("merges kanban columns with fallback pipeline stages and preserves empty stages", () => {
    const stages = [
      normalizePipelineStage({ id: "s-1", name: "Qualified", order: 0 }),
      normalizePipelineStage({ id: "s-2", name: "Proposal Sent", order: 1 }),
      normalizePipelineStage({
        id: "s-3",
        name: "Won",
        order: 2,
        isWon: true,
      }),
    ];

    const columns = normalizeKanbanColumns(
      {
        data: [
          {
            id: "s-2",
            name: "Proposal Sent",
            deals: [
              { id: "d-1", name: "Acme", value: 50000, stageId: "s-2" },
              { id: "d-2", name: "Beta", value: 25000, stageId: "s-2" },
            ],
          },
        ],
      },
      stages,
    );

    expect(columns.map((c) => c.stage.id)).toEqual(["s-1", "s-2", "s-3"]);
    expect(columns[0].deals).toHaveLength(0);
    expect(columns[1].deals).toHaveLength(2);
    expect(columns[1].totalValue).toBe(75000);
    expect(columns[2].deals).toHaveLength(0);
  });

  it("reorders stage IDs cleanly and ignores out-of-bounds moves", () => {
    const stages = [
      normalizePipelineStage({ id: "s-1", name: "A", order: 0 }),
      normalizePipelineStage({ id: "s-2", name: "B", order: 1 }),
      normalizePipelineStage({ id: "s-3", name: "C", order: 2 }),
    ];

    expect(reorderStageIds(stages, 0, 2)).toEqual(["s-2", "s-3", "s-1"]);
    expect(reorderStageIds(stages, 2, 1)).toEqual(["s-1", "s-3", "s-2"]);
    expect(reorderStageIds(stages, -1, 1)).toEqual(["s-1", "s-2", "s-3"]);
  });
});
