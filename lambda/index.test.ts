const mockSend = jest.fn();
const mockPutCommand = jest.fn();
const mockScanCommand = jest.fn();
const mockUpdateCommand = jest.fn();
const mockDeleteCommand = jest.fn();

import { handler } from "./index";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

jest.mock("@aws-sdk/lib-dynamodb", () => {
  const original = jest.requireActual("@aws-sdk/lib-dynamodb");
  return {
    ...original,
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend,
      })),
    },
    PutCommand: jest.fn((...args) => {
      mockPutCommand(...args);
      return { __type: "PutCommand", args };
    }),
    UpdateCommand: jest.fn((...args) => {
      mockUpdateCommand(...args);
      return { __type: "UpdateCommand", args };
    }),
    DeleteCommand: jest.fn((...args) => {
      mockDeleteCommand(...args);
      return { __type: "DeleteCommand", args };
    }),
  };
});

jest.mock("@aws-sdk/client-dynamodb", () => {
  const original = jest.requireActual("@aws-sdk/client-dynamodb");
  return {
    ...original,
    ScanCommand: jest.fn((...args) => {
      mockScanCommand(...args);
      return { __type: "ScanCommand", args };
    }),
  };
});

const TABLE_NAME = "ItemsTable";

describe("handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles POST method", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({ id: "1", name: "Test Item" }),
    } as any;
    mockSend.mockResolvedValueOnce({});
    const result = await handler(event);
    expect(mockPutCommand).toHaveBeenCalledWith({ TableName: TABLE_NAME, Item: { id: "1", name: "Test Item" } });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "Item added!" });
  });

  it("handles GET method", async () => {
    const event = { httpMethod: "GET" } as any;
    const items = [{ id: "1", name: "Test Item" }];
    mockSend.mockResolvedValueOnce({ Items: items });
    const result = await handler(event);
    expect(mockScanCommand).toHaveBeenCalledWith({ TableName: TABLE_NAME });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(items);
  });

  it("handles PUT method", async () => {
    const event = {
      httpMethod: "PUT",
      body: JSON.stringify({ id: "1", name: "Updated Name", price: 10 }),
    } as any;
    mockSend.mockResolvedValueOnce({});
    const result = await handler(event);
    expect(mockUpdateCommand).toHaveBeenCalled();
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "Item updated!" });
  });

  it("handles DELETE method", async () => {
    const event = {
      httpMethod: "DELETE",
      body: JSON.stringify({ id: "1" }),
    } as any;
    mockSend.mockResolvedValueOnce({});
    const result = await handler(event);
    expect(mockDeleteCommand).toHaveBeenCalledWith({ TableName: TABLE_NAME, Key: { id: "1" } });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "Item deleted!" });
  });

  it("returns 400 for unsupported method", async () => {
    const event = { httpMethod: "PATCH" } as any;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ message: "Unsupported request method" });
  });

  it("returns 500 on error", async () => {
    const event = { httpMethod: "GET" } as any;
    mockSend.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(event);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "DynamoDB error" });
  });
}); 