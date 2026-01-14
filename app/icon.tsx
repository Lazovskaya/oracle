import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
        }}
      >
        {/* Crystal ball/oracle icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" stroke="white" fill="none" />
          <circle cx="12" cy="12" r="3" stroke="white" fill="white" />
          <path d="M12 3v6" stroke="white" opacity="0.6" />
          <path d="M12 15v6" stroke="white" opacity="0.6" />
          <path d="M3 12h6" stroke="white" opacity="0.6" />
          <path d="M15 12h6" stroke="white" opacity="0.6" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
