insert into public.categories (name, slug)
values
  ('School essentials', 'school-essentials'),
  ('Fashion & finds', 'fashion-finds'),
  ('Food & snacks', 'food-snacks'),
  ('Gadgets & tech', 'gadgets-tech'),
  ('Books & reviewers', 'books-reviewers'),
  ('Arts & crafts', 'arts-crafts')
on conflict (slug) do nothing;
