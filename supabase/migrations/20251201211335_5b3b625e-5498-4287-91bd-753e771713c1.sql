-- Adicionar colunas cpf e chave_pix na tabela profissionais
ALTER TABLE profissionais 
ADD COLUMN cpf text,
ADD COLUMN chave_pix text;