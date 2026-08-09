import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'NestFinder — Find Your Perfect Home';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div
            style={{
              background: '#ffffff',
              width: 160,
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 40,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="11" fill="#00315b" />
              <path d="M5.5 11.5L12 6L18.5 11.5V18C18.5 18.28 18.28 18.5 18 18.5H6C5.72 18.5 5.5 18.28 5.5 18V11.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 18.5V13.5H14V18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            marginBottom: 20,
            textAlign: 'center',
            color: '#0f172a',
          }}
        >
          NestFinder
        </h1>
        <p
          style={{
            fontSize: 36,
            color: '#475569',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Find Your Perfect Home. Premium properties for sale and rent across India.
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
