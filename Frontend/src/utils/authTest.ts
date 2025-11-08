// Utility to test authentication status
export const testAuth = async () => {
    try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        console.log('🧪 Testing authentication...');
        
        const response = await fetch(`${API}/auth/me`, { 
            credentials: 'include' 
        });
        
        console.log('📊 Auth test response:', {
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ User authenticated:', data.user);
            return { authenticated: true, user: data.user };
        } else {
            console.log('❌ Not authenticated');
            return { authenticated: false, user: null };
        }
    } catch (error) {
        console.error('❌ Auth test failed:', error);
        return { authenticated: false, user: null, error };
    }
};

// Call this function in browser console to test
(window as any).testAuth = testAuth;
