// Onde: app/layout.js
// VERSÃO FINAL COM CABEÇALHO E RODAPÉ ATUALIZADOS

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ajuda Rio Bonito", // O título que aparece na aba do navegador
  description: "Plataforma de cadastro e gestão de ajuda para as vítimas da tragédia em Rio Bonito do Iguaçu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-green-700`}>
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
              <h1 className="text-2xl font-bold text-emerald-800">
                Ajuda RIO BONITO
              </h1>
              <p className="text-sm text-gray-600">
                Cadastro de pedido de ajuda voluntária
              </p>
              {/* ===== FIM DA ALTERAÇÃO ===== */}
            </div>
            <div className="text-right">
              <a href="/admin" className="text-sm font-medium text-gray-700 hover:text-emerald-600">
                Acesso Restrito
              </a>
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>

        <footer className="bg-gray-800 text-white mt-12 py-4">
          <div className="container mx-auto text-center text-sm">
            <p>&copy; 2025 | Desenvolvido por <a href="http://www.otrabalhador.com.br" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">www.otrabalhador.com.br</a></p>
          </div>
        </footer>
      </body>
    </html>
   );
}
