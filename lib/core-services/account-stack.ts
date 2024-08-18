import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";

interface AccountStackProps extends cdk.NestedStackProps {

}

export class AccountStack extends cdk.NestedStack {
    constructor(scope: Construct, id: string, props: AccountStackProps) {
        super(scope, id, props);

        // DynamoDB Table
        const table = new dynamodb.Table(this, 'AccountTable', {
            tableName: "Accounts",
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Lambda Functions
        const createLambda = new nodejs.NodejsFunction(this, "CreateLambda", {
            entry: './lambda/lambda/core-services/account/create.ts',
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_20_X,
            bundling: {
                format: nodejs.OutputFormat.ESM
            }
        });

        // Grant DynamoDB permissions to Lambda functions
        table.grantReadWriteData(createLambda);

        // API Gateway
        const api = new apiGateway.RestApi(this, 'AccountAPI', {
            restApiName: 'Accounts Service',
            description: 'This service serves accounts.',
            endpointConfiguration: {
                types: [apiGateway.EndpointType.REGIONAL]
            },
        });

        const accounts = api.root.addResource('accounts');
        accounts.addMethod('POST', new apiGateway.LambdaIntegration(createLambda));
    }
}