export const validateCNPJ = async (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);

    if (!response.ok) {
       if(response.status === 404) throw new Error('CNPJ não existe na base.');
       if(response.status === 429) throw new Error('Muitas requisições. Aguarde.');
       throw new Error('Erro de conexão.');
    }

    const data = await response.json();
    return {
      status: 'success',
      data: {
        razao_social: data.razao_social,
        cnpj: data.cnpj,
        situacao_cadastral: data.descricao_situacao_cadastral,
        cnae_fiscal_principal: data.cnae_fiscal_descricao
      }
    };
  } catch (err: any) {
    throw new Error(err.message || 'Erro desconhecido.');
  }
};

export const fetchCEP = async (cep: string) => {
   const cleanCEP = cep.replace(/\D/g, '');
   if (cleanCEP.length !== 8) throw new Error('CEP inválido');

   const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCEP}`);
   if (!res.ok) throw new Error('CEP não encontrado');

   return await res.json();
};
