#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { PayrollStack } from '../lib/infra-stack';

const app = new cdk.App();
new PayrollStack(app, 'PayrollStack', {

  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});
