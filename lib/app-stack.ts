import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {AccountStack} from './core-services/account-stack';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new AccountStack(this, 'AccountStack', {});
  }
}
