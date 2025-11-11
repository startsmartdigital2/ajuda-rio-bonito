// Onde: app/layout.js
// CÓDIGO COMPLETO DO LAYOUT COM CABEÇALHO E RODAPÉ

import "./globals.css"; // Importa nossos estilos globais

export const metadata = {
  title: "SOS Rio Bonito do Iguaçu",
  description: "Plataforma de ajuda para as vítimas do tornado.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-green-700"> {/* Cor de fundo verde-esperança */}
        <div className="flex flex-col min-h-screen">
          {/* CABEÇALHO */}
          <header className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-emerald-700">
                SOS Rio Bonito do Iguaçu
              </h1>
              {/* Futuramente, o login pode vir aqui, mas por enquanto fica no /admin */}
              <a href="/admin" className="text-sm font-medium text-gray-600 hover:text-emerald-700">
                Acesso Restrito
              </a>
            </div>
          </header>

          {/* CONTEÚDO PRINCIPAL DA PÁGINA */}
          <main className="flex-grow">
            {children}
          </main>

          {/* RODAPÉ */}
          <footer className="bg-white text-center p-4 mt-8 shadow-inner">
            <p className="text-sm text-gray-500">
              Desenvolvido por <a href="http://www.otrabalhador.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:underline">www.otrabalhador.com.br</a>
            </p>
          </footer>
        </div>
      </body>
    </html>
   );
}
