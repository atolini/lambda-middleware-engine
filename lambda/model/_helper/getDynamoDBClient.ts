import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

const getDynamoDBClient = (): DynamoDBDocumentClient => {
    const client = new DynamoDBClient();
    return DynamoDBDocumentClient.from(client);
}

export default getDynamoDBClient;