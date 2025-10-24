const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_S3_BUCKET;

async function disableBlockPublicAccess() {
  try {
    console.log('🔓 Disabling Block Public Access...');
    
    // Disable block public access
    await s3.putPublicAccessBlock({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    }).promise();
    
    console.log('✅ Block Public Access disabled successfully');
    
    // Now set the bucket policy
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };

    console.log('📝 Setting bucket policy...');
    await s3.putBucketPolicy({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    console.log('✅ Bucket policy set successfully');

    // Test a file
    console.log('\n🧪 Testing file accessibility...');
    const testUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/landlord-1758129990546-95173211.webp`;
    console.log(`🔗 Test URL: ${testUrl}`);
    
    console.log('\n🎉 S3 is now publicly accessible!');
    console.log('📋 Your images should now load in the frontend');
    
  } catch (error) {
    console.error('❌ Failed to disable block public access:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('\n🔧 Manual steps required:');
      console.log('1. Go to AWS S3 Console: https://s3.console.aws.amazon.com/');
      console.log(`2. Select bucket: ${bucketName}`);
      console.log('3. Go to Permissions tab');
      console.log('4. Click "Edit" on "Block public access"');
      console.log('5. Uncheck all 4 boxes');
      console.log('6. Save changes');
      console.log('7. Add this bucket policy:');
      console.log(JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        }]
      }, null, 2));
    }
  }
}

disableBlockPublicAccess();
