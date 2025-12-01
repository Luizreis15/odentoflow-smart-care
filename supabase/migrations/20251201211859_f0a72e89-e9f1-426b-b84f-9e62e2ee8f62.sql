-- Adicionar colunas cpf e cargo na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN cpf text,
ADD COLUMN cargo text;

COMMENT ON COLUMN usuarios.cpf IS 'CPF do usuário';
COMMENT ON COLUMN usuarios.cargo IS 'Cargo/função na clínica (ex: Gerente, Secretária, Auxiliar)';