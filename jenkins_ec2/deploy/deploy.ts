#!/usr/bin/env node
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';

class S3ui extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const oai = new OriginAccessIdentity(this, `${id}-oai`, {
      comment: id 
    });


    const s3 = new Bucket(this, id, { 
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
      encryption: BucketEncryption.UNENCRYPTED
    });
    s3.grantRead(oai);

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
        sources: [s3deploy.Source.asset('../app/build')],
        destinationBucket: s3,
    });

    const distribution = new CloudFrontWebDistribution(this, `${id}-distribution`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: s3,
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }]
        },
      ],
      errorConfigurations: [{
        errorCode: 404,
        responseCode: 200,
        responsePagePath: '/index.html'
      }],
    });
  }
};

const app = new cdk.App();
new S3ui(app, 'HelloWordReactStack');
