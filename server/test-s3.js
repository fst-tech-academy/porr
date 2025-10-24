require('dotenv').config();
const { s3 } = require('./config/s3');

async function testS3Connection() {
  try {
    console.log('🧪 Testing S3 connection...');
    
    // Test 1: List objects in bucket
    console.log('\n📋 Listing objects in bucket...');
    const listParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      MaxKeys: 5
    };
    
    const listResult = await s3.listObjectsV2(listParams).promise();
    console.log(`✅ Found ${listResult.Contents?.length || 0} objects in bucket`);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('📁 Sample objects:');
      listResult.Contents.forEach((obj, index) => {
        console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
      });
    }
    
    // Test 2: Check if a test file exists (replace with actual file key if needed)
    const testKey = 'test-image.png';
    console.log(`\n🔍 Checking if ${testKey} exists...`);
    
    try {
      const headResult = await s3.headObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: testKey
      }).promise();
      
      console.log('✅ Image exists!');
      console.log(`   Size: ${headResult.ContentLength} bytes`);
      console.log(`   Type: ${headResult.ContentType}`);
      console.log(`   Last Modified: ${headResult.LastModified}`);
      
      // Test 3: Generate a signed URL (for private access if needed)
      const signedUrl = await s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: testKey,
        Expires: 3600 // 1 hour
      });
      
      console.log(`\n🔗 Signed URL (valid for 1 hour):`);
      console.log(signedUrl);
      
    } catch (headError) {
      if (headError.code === 'NotFound') {
        console.log('❌ Image not found. Make sure the key is correct.');
      } else {
        console.log('❌ Error checking image:', headError.message);
      }
    }
    
    console.log('\n🎉 S3 connection test completed!');
    
  } catch (error) {
    console.error('❌ S3 connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your AWS credentials in .env file');
    console.log('2. Verify your S3 bucket name');
    console.log('3. Ensure your IAM user has S3 permissions');
    console.log('4. Check your AWS region setting');
  }
}

// Run the test
testS3Connection();
