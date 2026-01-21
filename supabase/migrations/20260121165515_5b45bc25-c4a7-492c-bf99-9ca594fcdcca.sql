-- Add unique constraints to prevent duplicate entries in expense catalog

-- expense_macro_types: unique per clinic + codigo
CREATE UNIQUE INDEX IF NOT EXISTS expense_macro_types_clinic_codigo_unique 
ON expense_macro_types(clinic_id, codigo);

-- expense_groups: unique per clinic + macro_type + nome
CREATE UNIQUE INDEX IF NOT EXISTS expense_groups_clinic_macro_nome_unique 
ON expense_groups(clinic_id, macro_type_id, nome);

-- expense_items: unique per clinic + group + nome  
CREATE UNIQUE INDEX IF NOT EXISTS expense_items_clinic_group_nome_unique 
ON expense_items(clinic_id, group_id, nome);