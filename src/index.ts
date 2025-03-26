import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "ItemsTable";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const putCommand = new PutCommand({
        TableName: TABLE_NAME,
        Item: { id: body.id, name: body.name },
      });
      await docClient.send(putCommand);
      return { statusCode: 200, body: JSON.stringify({ message: "Item added!" }) };
    }

    if (event.httpMethod === "GET") {
      const scanCommand = new ScanCommand({ TableName: TABLE_NAME });
      const { Items } = await docClient.send(scanCommand);
      return { statusCode: 200, body: JSON.stringify(Items) };
    }

    return { statusCode: 400, body: JSON.stringify({ message: "Unsupported request method" }) };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
