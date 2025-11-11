// Onde: lib/supabaseClient.js
// CÓDIGO À PROVA DE FALHAS: Colocando as chaves diretamente para garantir o funcionamento.

import { createClient } from '@supabase/supabase-js';

// ==================================================================
// ATENÇÃO: COLOQUE SUAS CHAVES REAIS DIRETAMENTE AQUI
// ==================================================================

const supabaseUrl = 'https://dwztvkuaifezuutiyyzo.supabase.co'; // <-- SUA URL DA SUPABASE AQUI
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enR2a3VhaWZlenV1dGl5eXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzQ4MTYsImV4cCI6MjA3ODM1MDgxNn0.eloncGlH070ScpZLV8P77OxFhrwNjhz3dMc34VIGU1E'; // <-- SUA CHAVE ANON PUBLIC AQUI

// ==================================================================
// FIM DA ÁREA DE CONFIGURAÇÃO
// ==================================================================


// Verificação de segurança para garantir que as chaves foram inseridas
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('SUA_URL_AQUI' )) {
  // Esta mensagem de erro aparecerá se as chaves não forem substituídas.
  throw new Error("ERRO CRÍTICO: As chaves da Supabase não foram inseridas diretamente no arquivo lib/supabaseClient.js. Por favor, adicione-as para continuar.");
}

// Cria e exporta o cliente Supabase para ser usado em todo o seu app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
