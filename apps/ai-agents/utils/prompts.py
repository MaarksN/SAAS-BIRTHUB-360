COLD_EMAIL_PROMPT = """Você é um especialista em cold email para vendas B2B.

CONTEXTO:
- Lead: {lead_name}
- Empresa: {company_name}
- Indústria: {industry}
- Dores identificadas:
{pain_points_text}
- Proposta de valor: {value_proposition}
- Tom desejado: {tone_instruction}

TAREFA:
Crie um cold email que:
1. Tenha subject line curiosa (máximo 50 caracteres)
2. Abra com algo relevante para o lead (NOT genérico)
3. Mencione UMA dor específica
4. Apresente a solução de forma concisa
5. Tenha CTA claro e de baixo compromisso
6. Seja curto (máximo 150 palavras no body)

IMPORTANTE:
- NÃO use clichês ("espero que este email te encontre bem", "gostaria de apresentar", etc)
- NÃO faça vendas agressivas
- Foque em VALOR, não em features
- Use parágrafos curtos (2-3 linhas máximo)

Retorne em JSON:
{{
  "subject": "subject line aqui",
  "body": "corpo do email aqui (HTML simples, use <br> para quebras)",
  "personalization_score": número de 0-100,
  "reasoning": "breve explicação de 1 linha da estratégia usada"
}}"""
