/**
 * Connection Test Utility for Patient API
 * 
 * This file contains diagnostic functions to test backend connectivity
 * and troubleshoot common API issues.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL1 || 'http://localhost:8080/api/v1';

export interface ConnectionTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: Record<string, any>;
}

/**
 * Test 1: Basic Network Connectivity
 * Checks if the backend server is reachable
 */
async function testNetworkConnectivity(): Promise<ConnectionTestResult> {
  try {
    console.log('🔍 Test 1: Testing network connectivity...');
    
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    console.log('✅ Network response received:', response.status);

    return {
      test: 'Network Connectivity',
      status: 'pass',
      message: `Successfully connected to ${API_BASE_URL}`,
      details: {
        status: response.status,
        url: API_BASE_URL,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ Network connectivity failed:', error);
    
    return {
      test: 'Network Connectivity',
      status: 'fail',
      message: `Unable to reach backend server at ${API_BASE_URL}`,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: API_BASE_URL,
        suggestion: 'Make sure your Spring Boot backend is running on the correct port',
      },
    };
  }
}

/**
 * Test 2: CORS Configuration
 * Checks if CORS is properly configured
 */
async function testCorsConfiguration(): Promise<ConnectionTestResult> {
  try {
    console.log('🔍 Test 2: Testing CORS configuration...');
    
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };

    console.log('✅ CORS response:', corsHeaders);

    const allowOrigin = corsHeaders['Access-Control-Allow-Origin'];
    const isCorsEnabled = allowOrigin === '*' || allowOrigin === 'http://localhost:3000';

    return {
      test: 'CORS Configuration',
      status: isCorsEnabled ? 'pass' : 'warning',
      message: isCorsEnabled 
        ? 'CORS is properly configured' 
        : 'CORS headers detected but may need configuration review',
      details: {
        ...corsHeaders,
        responseStatus: response.status,
      },
    };
  } catch (error) {
    console.error('❌ CORS test failed:', error);
    
    // CORS errors often manifest as network errors, so this might just be a network issue
    return {
      test: 'CORS Configuration',
      status: 'warning',
      message: 'Unable to test CORS - this might be a network issue or CORS misconfiguration',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Check if your backend has CORS configured for http://localhost:3000',
      },
    };
  }
}

/**
 * Test 3: Patients API Endpoint
 * Tests the actual patients endpoint
 */
async function testPatientsEndpoint(): Promise<ConnectionTestResult> {
  try {
    console.log('🔍 Test 3: Testing patients API endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/patients?pageNo=0&pageSize=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('✅ Patients API response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Patients API error:', errorText);
      
      return {
        test: 'Patients API Endpoint',
        status: 'fail',
        message: `API returned error: ${response.status}`,
        details: {
          status: response.status,
          error: errorText,
        },
      };
    }

    const data = await response.json();
    
    return {
      test: 'Patients API Endpoint',
      status: 'pass',
      message: 'Patients API is working correctly',
      details: {
        totalPatients: data.data?.totalElements || 0,
        totalPages: data.data?.totalPages || 0,
        sampleData: data.data?.content?.[0] || null,
      },
    };
  } catch (error) {
    console.error('❌ Patients API test failed:', error);
    
    return {
      test: 'Patients API Endpoint',
      status: 'fail',
      message: 'Failed to access patients API',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Test 4: Environment Configuration
 * Verifies environment variables are set correctly
 */
function testEnvironmentConfig(): ConnectionTestResult {
  console.log('🔍 Test 4: Checking environment configuration...');
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL1;
  
  const isValid = apiUrl && apiUrl.length > 0;
  const isLocalhost = apiUrl?.includes('localhost');
  
  const details = {
    NEXT_PUBLIC_API_URL1: apiUrl || 'NOT SET',
    isLocalhost,
    nodeEnv: process.env.NODE_ENV,
  };

  console.log('✅ Environment config:', details);

  if (!isValid) {
    return {
      test: 'Environment Configuration',
      status: 'fail',
      message: 'NEXT_PUBLIC_API_URL1 environment variable is not set',
      details: {
        ...details,
        suggestion: 'Add NEXT_PUBLIC_API_URL1 to your .env.local file',
      },
    };
  }

  return {
    test: 'Environment Configuration',
    status: isLocalhost ? 'warning' : 'pass',
    message: isLocalhost 
      ? 'Using localhost - make sure backend is running' 
      : 'Environment variable is configured',
    details,
  };
}

/**
 * Test 5: API Response Format
 * Checks if API returns data in expected format
 */
async function testApiResponseFormat(): Promise<ConnectionTestResult> {
  try {
    console.log('🔍 Test 5: Testing API response format...');
    
    const response = await fetch(`${API_BASE_URL}/patients?pageNo=0&pageSize=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        test: 'API Response Format',
        status: 'warning',
        message: 'Unable to test format - API returned error',
        details: { status: response.status },
      };
    }

    const data = await response.json();
    
    const hasExpectedStructure = 
      'data' in data &&
      'message' in data &&
      'status' in data;

    console.log('✅ API response structure:', hasExpectedStructure);

    return {
      test: 'API Response Format',
      status: hasExpectedStructure ? 'pass' : 'warning',
      message: hasExpectedStructure 
        ? 'API response format matches expected structure' 
        : 'API response format differs from expected',
      details: {
        hasDataField: 'data' in data,
        hasMessageField: 'message' in data,
        hasStatusField: 'status' in data,
        actualKeys: Object.keys(data),
      },
    };
  } catch (error) {
    console.error('❌ API format test failed:', error);
    
    return {
      test: 'API Response Format',
      status: 'fail',
      message: 'Failed to test API response format',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Run all connection tests
 */
export async function runAllTests(): Promise<ConnectionTestResult[]> {
  console.log('🚀 Running Patient API Connection Tests...\n');
  
  const results: ConnectionTestResult[] = [];
  
  // Test 1: Environment Configuration (no network needed)
  results.push(testEnvironmentConfig());
  
  // Test 2: Network Connectivity
  results.push(await testNetworkConnectivity());
  
  // Test 3: CORS Configuration
  results.push(await testCorsConfiguration());
  
  // Test 4: Patients API Endpoint
  results.push(await testPatientsEndpoint());
  
  // Test 5: API Response Format
  results.push(await testApiResponseFormat());
  
  console.log('\n✅ All tests completed!');
  console.log('Results:', results);
  
  return results;
}
