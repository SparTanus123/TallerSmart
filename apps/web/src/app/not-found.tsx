import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-fg">Página no encontrada</h2>
      <p className="mt-2 text-fg-3">La página que buscas no existe o ha sido movida.</p>
      <Link href="/" className="btn btn-primary mt-4">
        Volver al inicio
      </Link>
    </div>
  );
}
