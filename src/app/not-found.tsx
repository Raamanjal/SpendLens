// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-xs font-semibold text-gray-400 uppercase
                      tracking-widest mb-3">
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Audit not found
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          This audit link may have expired or never existed.
        </p>
        <Link
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700
                     text-white text-sm font-semibold px-5 py-2.5
                     rounded-lg transition-colors"
        >
          Run a free audit
        </Link>
      </div>
    </div>
  );
}