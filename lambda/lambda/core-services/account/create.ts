import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {Pipeline} from "@pipeline";
import httpJsonBodyParser from "@middleware-suite/httpJsonBodyParser";
import validator from "@middleware-suite/validator";
import {AccountSchema} from "@model/account";
import {Handler, MiddlewareContext} from "@middleware";

const lambda: Handler<APIGatewayProxyEvent, APIGatewayProxyResult, Context> =
    async (event: APIGatewayProxyEvent, context: Context, middlewareContext: MiddlewareContext): Promise<APIGatewayProxyResult> => {
    console.log(middlewareContext);
    return {
        statusCode: 200,
        body: ''
    }
}

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    return await Pipeline()
        .use(httpJsonBodyParser())
        .use(validator({
            schema: AccountSchema,
            mode: 'put'
        }))
        .handler(lambda)
        .run(event, context);
};




