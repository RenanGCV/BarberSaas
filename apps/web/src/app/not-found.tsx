export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <p className="text-xl text-text-secondary mb-8">Página não encontrada</p>
        <a href="/dashboard" className="btn btn-primary">
          Voltar ao Dashboard
        </a>
      </div>
    </div>
  );
}
