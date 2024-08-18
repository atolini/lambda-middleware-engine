import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Chain, ErrorHandler, MiddlewareContext} from "@middleware";

const defaultErrorHandler: ErrorHandler<APIGatewayProxyEvent, APIGatewayProxyResult, Context> =
    (req: APIGatewayProxyEvent,
     context: Context,
     middlewareContext: MiddlewareContext,
     error: unknown): Promise<APIGatewayProxyResult> => {
        return Promise.resolve({
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error"
            })
        });
    };

export const Pipeline = (): Chain<APIGatewayProxyEvent, APIGatewayProxyResult, Context> => {
    return new Chain<APIGatewayProxyEvent, APIGatewayProxyResult, Context>(defaultErrorHandler);
};


