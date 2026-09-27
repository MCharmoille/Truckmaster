import tls from 'node:tls';

// Node 24+ on Windows often does not trust the OS certificate store by default.
// Axios → Gemini then fails with "unable to verify the first certificate".
if (typeof tls.getCACertificates === 'function' && typeof tls.setDefaultCACertificates === 'function') {
    tls.setDefaultCACertificates(tls.getCACertificates('system'));
}
