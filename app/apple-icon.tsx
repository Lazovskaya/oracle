import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
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
          borderRadius: '22.5%',
        }}
      >
        {/* Crystal ball/oracle icon - larger for apple-icon */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" stroke="white" fill="none" />
          <circle cx="12" cy="12" r="3" stroke="white" fill="white" />
          <path d="M12 3v6" stroke="white" opacity="0.6" />
          <path d="M12 15v6" stroke="white" opacity="0.6" />
          <path d="M3 12h6" stroke="white" opacity="0.6" />
          <path d="M15 12h6" stroke="white" opacity="0.6" />
          <path d="M8 8l1.5 1.5" stroke="white" opacity="0.4" />
          <path d="M14.5 14.5l1.5 1.5" stroke="white" opacity="0.4" />
          <path d="M16 8l-1.5 1.5" stroke="white" opacity="0.4" />
          <path d="M9.5 14.5l-1.5 1.5" stroke="white" opacity="0.4" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
