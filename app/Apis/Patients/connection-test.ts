/**
 * API Connection Test Utility
 * 
 * Use this to test if your backend is accessible and properly configured.
 * Run these tests to diagnose connection issues.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ConnectionTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

/**
 * Test 1: Check if environment variable is set
 */
export function testEnvironmentVariable(): ConnectionTestResult {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!envUrl) {
    return {
      test: 'Environment Variable Check',
      status: 'warning',
      message: 'NEXT_PUBLIC_API_URL not set in .env.local',
      details: { using: API_BASE_URL }
    };
  }

  return {
    test: 'Environment Variable Check',
    status: 'pass',
    message: 'NEXT_PUBLIC_API_URL is set',
    details: { value: envUrl }
  };
}

/**
 * Test 2: Validate URL format
 */
export function testUrlFormat(): ConnectionTestResult {
  if (!API_BASE_URL) {
    return {
      test: 'URL Format Validation',
      status: 'fail',
      message: 'API_BASE_URL is not defined',
      details: { error: 'Environment variable NEXT_PUBLIC_API_URL is not set' }
    };
  }

  try {
    const url = new URL(API_BASE_URL);
    
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return {
        test: 'URL Format Validation',
        status: 'fail',
        message: 'Invalid protocol. Must be http:// or https://',
        details: { protocol: url.protocol }
      };
    }

    return {
      test: 'URL Format Validation',
      status: 'pass',
      message: 'URL format is valid',
      details: { protocol: url.protocol, hostname: url.hostname, port: url.port || '8080' }
    };
  } catch (error) {
    return {
      test: 'URL Format Validation',
      status: 'fail',
      message: 'Invalid URL format',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Test 3: Test backend connectivity
 */
export async function testBackendConnectivity(): Promise<ConnectionTestResult> {
  if (!API_BASE_URL) {
    return {
      test: 'Backend Connectivity',
      status: 'fail',
      message: 'API_BASE_URL is not defined',
      details: { error: 'Environment variable NEXT_PUBLIC_API_URL is not set' }
    };
  }

  try {
    console.log('📡 Testing connection to:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/patients?pageNo=0&pageSize=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        test: 'Backend Connectivity',
        status: 'pass',
        message: 'Successfully connected to backend',
        details: {
          status: response.status,
          hasData: !!data,
          url: API_BASE_URL
        }
      };
    } else {
      return {
        test: 'Backend Connectivity',
        status: 'fail',
        message: `Backend returned error: ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: API_BASE_URL
        }
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    let suggestion = 'Check if backend server is running';
    if (errorMessage.includes('Failed to fetch')) {
      suggestion = 'Backend server is not running or CORS is not configured. Start your Spring Boot server on port 8080.';
    } else if (errorMessage.includes('CORS')) {
      suggestion = 'Add CORS configuration to your backend to allow http://localhost:3000';
    }

    return {
      test: 'Backend Connectivity',
      status: 'fail',
      message: 'Failed to connect to backend',
      details: {
        error: errorMessage,
        url: API_BASE_URL,
        suggestion
      }
    };
  }
}

/**
 * Test 4: Test patient photo endpoint
 */
export async function testPhotoEndpoint(): Promise<ConnectionTestResult> {
  if (!API_BASE_URL) {
    return {
      test: 'Patient Photo Endpoint',
      status: 'fail',
      message: 'API_BASE_URL is not defined',
      details: { error: 'Environment variable NEXT_PUBLIC_API_URL is not set' }
    };
  }

  try {
    const testPatientId = 1;
    const url = `${API_BASE_URL}/patients/image/${testPatientId}`;
    
    console.log('📷 Testing photo endpoint:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/*, application/json',
      },
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || 'unknown';
      return {
        test: 'Patient Photo Endpoint',
        status: 'pass',
        message: 'Photo endpoint is accessible',
        details: {
          status: response.status,
          contentType,
          url
        }
      };
    } else if (response.status === 404) {
      return {
        test: 'Patient Photo Endpoint',
        status: 'warning',
        message: 'Photo endpoint exists but patient not found (this is OK)',
        details: {
          status: response.status,
          url,
          note: 'Patient ID 1 might not have a photo'
        }
      };
    } else {
      return {
        test: 'Patient Photo Endpoint',
        status: 'fail',
        message: `Photo endpoint returned: ${response.status}`,
        details: {
          status: response.status,
          url
        }
      };
    }
  } catch (error) {
    return {
      test: 'Patient Photo Endpoint',
      status: 'fail',
      message: 'Failed to access photo endpoint',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: API_BASE_URL
      }
    };
  }
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<ConnectionTestResult[]> {
  console.log('🧪 Running API Connection Tests...\n');
  console.log('=====================================');
  
  const results: ConnectionTestResult[] = [];

  // Sync tests
  results.push(testEnvironmentVariable());
  results.push(testUrlFormat());

  // Async tests
  results.push(await testBackendConnectivity());
  results.push(await testPhotoEndpoint());

  console.log('\n=====================================');
  console.log('📊 Test Results Summary:');
  console.log('=====================================');
  
  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✅' : 
                 result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${icon} ${result.test}: ${result.message}`);
  });

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warnCount = results.filter(r => r.status === 'warning').length;

  console.log('\n=====================================');
  console.log(`Total: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);
  console.log('=====================================\n');

  return results;
}

// Auto-run tests when imported in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run tests in browser console
  setTimeout(() => {
    console.log('%c🔍 Patient API Connection Tests', 'color: #10b981; font-size: 16px; font-weight: bold;');
    runAllTests();
  }, 1000);
}
