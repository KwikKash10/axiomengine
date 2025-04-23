import dynamic from 'next/dynamic';

// Export the page component with server-side rendering disabled
export default dynamic(() => import('../components/FormPage'), { ssr: false }); 