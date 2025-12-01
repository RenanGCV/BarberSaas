'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
        <p className="text-text-secondary mb-6">{error.message}</p>
        <button onClick={reset} className="btn btn-primary">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
