import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "./simpleApi";
import { getNotifications, getUnreadNotifications } from "./notifications-api";

vi.mock("./simpleApi", () => ({ default: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const item = (id: string, isRead: boolean) => ({
  id, isRead, title: id, message: id, createdAt: "2026-10-28T00:00:00Z",
});

beforeEach(() => get.mockReset());

describe("tenant notifications", () => {
  it("does not send the backend's unsupported unreadOnly query parameter", async () => {
    get.mockResolvedValueOnce({ data: { data: { notifications: [item("a", false)], total: 1 } } });
    expect((await getNotifications()).notifications).toHaveLength(1);
    expect(get).toHaveBeenCalledWith("/notifications", { params: { page: 1, limit: 20 } });
  });

  it("filters unread notifications across backend pages before paginating", async () => {
    get.mockResolvedValueOnce({ data: { data: { notifications: [item("a", true), item("b", false)], pagination: { hasMore: true, total: 4 } } } });
    get.mockResolvedValueOnce({ data: { data: { notifications: [item("c", false), item("d", true)], pagination: { hasMore: false, total: 4 } } } });
    const page = await getUnreadNotifications(2, 1);
    expect(page).toMatchObject({ notifications: [item("c", false)], total: 2, hasMore: false });
    expect(get).toHaveBeenNthCalledWith(2, "/notifications", { params: { page: 2, limit: 20 } });
  });
});
