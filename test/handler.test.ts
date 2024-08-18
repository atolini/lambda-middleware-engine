import httpJsonBodyParser from "@middleware-suite/httpJsonBodyParser";
import validator from "@middleware-suite/validator";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {MiddlewareContext} from "@middleware";
import {Pipeline} from "@pipeline";
import {mockContext} from "./_helper/mockContext";
import {mockAPIGatewayProxyEvent} from "./_helper/mockAPIGatewayProxyEvent";
import {number, schema, string} from "dynamodb-toolbox";

export const fakeSchema = schema({
    name: string().required(),
    age: number().required()
});

const lambda = async (req: APIGatewayProxyEvent,
                      context: Context,
                      middlewareContext: MiddlewareContext): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'emitted by lambda handler'
        })
    }
}

describe('Testando handler no Middleware', () => {
    const context: Context = mockContext();
    const event: APIGatewayProxyEvent = mockAPIGatewayProxyEvent({
        name: "Lucas",
        age: 28
    });

    test('Caso de sucesso: o pipeline atinge o lambda', async () => {
        const res = await Pipeline()
            .use(httpJsonBodyParser())
            .use(validator({
                schema: fakeSchema,
                mode: 'put'
            }))
            .handler(lambda)
            .run(event, context);

        const body = JSON.parse(res.body);

        expect(body.message).toBe('emitted by lambda handler');
    })
});