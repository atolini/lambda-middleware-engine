import {Parser} from "dynamodb-toolbox";
import {AccountSchema} from "@model/account";

const generateId = (prefix: string): string => {
    const timestamp = Math.floor(Date.now() / 1000);
    const truncatedTimestamp = Math.floor(timestamp / 100);
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${truncatedTimestamp}-${randomPart}`;
};

test('Testing generateId', () => {
    console.log(generateId('NAT'))
})

test('Testing schema', () => {
    const validAccount = AccountSchema
        .build(Parser)
        .parse({
            id: 'nat',
            name: 'Natura & CO',
        })
    console.log(validAccount);
})