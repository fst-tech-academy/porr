const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_S3_BUCKET;

async function fixS3Permissions() {
  try {
    console.log('🔧 Fixing S3 bucket permissions...');
    
    // 1. Update bucket policy to make objects publicly readable
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
    console.log('✅ Bucket policy updated successfully');

    // 2. Update CORS configuration
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    };

    console.log('🌐 Setting CORS configuration...');
    await s3.putBucketCors({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration
    }).promise();
    console.log('✅ CORS configuration updated successfully');

    // 3. Test a few files to make sure they're accessible
    console.log('\n🧪 Testing file accessibility...');
    const testFiles = [
      'landlord-1758129990546-95173211.webp',
      'broker-1758113494450-926780864.webp',
      'tenant-1758050641567-510907587.jpg'
    ];

    for (const fileName of testFiles) {
      try {
        const headObject = await s3.headObject({
          Bucket: bucketName,
          Key: fileName
        }).promise();
        console.log(`✅ ${fileName} - accessible (${headObject.ContentLength} bytes)`);
      } catch (error) {
        console.log(`❌ ${fileName} - not accessible: ${error.message}`);
      }
    }

    console.log('\n🎉 S3 permissions fixed successfully!');
    console.log('📋 Your files should now be publicly accessible at:');
    console.log(`   https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/[filename]`);

  } catch (error) {
    console.error('❌ Failed to fix S3 permissions:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('\n🔧 Manual steps required:');
      console.log('1. Go to AWS S3 Console');
      console.log(`2. Select bucket: ${bucketName}`);
      console.log('3. Go to Permissions tab');
      console.log('4. Edit Bucket Policy and add:');
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

fixS3Permissions();
