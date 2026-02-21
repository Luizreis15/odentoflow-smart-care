
ALTER TABLE public.receivable_titles 
  ADD COLUMN ortho_case_id UUID REFERENCES public.ortho_cases(id);

CREATE INDEX idx_receivable_titles_ortho_case 
  ON public.receivable_titles(ortho_case_id);
