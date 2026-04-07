import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import { Construct } from 'constructs';

export class PayrollStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const amplifyApp = new amplify.App(this, 'PayrollApp', {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'MinaMalak-cmd',
        repository: 'billing-automation',
        // GitHub Personal Access Token stored in AWS Secrets Manager
        oauthToken: cdk.SecretValue.secretsManager('github-token'),
      }),
      environmentVariables: {
        // These will be available to your Next.js Server Actions
        EMAIL_USER: 'your-email@gmail.com',
        EMAIL_PASS: cdk.SecretValue.secretsManager('payroll-email-pass').toString(),
        MODE: 'excel',
      },
    });

    const mainBranch = amplifyApp.addBranch('main');
  }
}
