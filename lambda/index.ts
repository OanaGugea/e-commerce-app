import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "ItemsTable";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Event:", JSON.stringify(event));
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: "",
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const putCommand = new PutCommand({
        TableName: TABLE_NAME,
        Item: { id: body.id, name: body.name },
      });
      await docClient.send(putCommand);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: "Item added!" }), };
    }

    if (event.httpMethod === "GET") {
      const scanCommand = new ScanCommand({ TableName: TABLE_NAME });
      const { Items } = await docClient.send(scanCommand);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(Items), };
    }

    if (event.httpMethod === "PUT") {
      const { id, ...updateFields } = JSON.parse(event.body || "{}");
      await docClient.send(new UpdateCommand({
        TableName: "ItemsTable",
        Key: { id },
        UpdateExpression: `set ${Object.keys(updateFields).map((key, i) => `#${key} = :val${i}`).join(", ")}`,
        ExpressionAttributeNames: Object.keys(updateFields).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        ExpressionAttributeValues: Object.values(updateFields).reduce((acc: any, val, i) => ({ ...acc, [`:val${i}`]: val }), {}) as any,
      }));
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: "Item updated!" }), };
    }

    if (event.httpMethod === "DELETE") {
      const { id } = JSON.parse(event.body || "{}");
      await docClient.send(new DeleteCommand({
        TableName: "ItemsTable",
        Key: { id },
      }));
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: "Item deleted!" }), };
    }

    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unsupported request method" }), };
  } catch (error: any) {
    console.error("Error:", error);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: error.message }), };
  }
};
