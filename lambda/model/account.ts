import {Entity, schema, string, Table} from "dynamodb-toolbox";
import toUpperCase from "./_helper/toUpperCase";
import getDynamoDBClient from "@model/_helper/getDynamoDBClient";

export const AccountTable = new Table({
    documentClient: getDynamoDBClient(),
    name: "Accounts",
    partitionKey: {
        name: "id",
        type: "string",
    }
});

export const AccountSchema = schema({
    id: string()
        .validate(input => input.length === 3 ? true : 'ID must be exactly 3 characters long')
        .transform(toUpperCase)
        .key(),
    name: string(),
});

export const AccountEntity = new Entity({
    name: 'account',
    table: AccountTable,
    schema: AccountSchema
});