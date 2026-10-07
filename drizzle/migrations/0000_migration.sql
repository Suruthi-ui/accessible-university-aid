CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code text NOT NULL UNIQUE,
  name text NOT NULL,
  program text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  experience_years int NOT NULL DEFAULT 0,
  availability_days text[] NOT NULL DEFAULT '{}',
  availability_label text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  sessions int NOT NULL DEFAULT 0,
  bio text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_code text NOT NULL,
  category text NOT NULL,
  support_required text NOT NULL,
  request_date date NOT NULL,
  request_time text NOT NULL,
  location text NOT NULL,
  urgency text NOT NULL DEFAULT 'Medium',
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  volunteer_id uuid REFERENCES public.volunteers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.students TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.volunteers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.support_requests TO anon, authenticated;
GRANT ALL ON public.students, public.volunteers, public.support_requests TO service_role;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo read students" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo add students" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "demo read volunteers" ON public.volunteers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo add volunteers" ON public.volunteers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "demo update volunteers" ON public.volunteers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo read requests" ON public.support_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo add requests" ON public.support_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "demo update requests" ON public.support_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.students (student_code, name, program) VALUES
('U2024118','Aisha Rahman','BA English Literature'),
('U2023042','Dev Patel','BSc Computer Science'),
('U2025007','Lena Fischer','BSc Psychology'),
('U2022210','Kofi Mensah','BEng Mechanical'),
('U2024361','Sofia Alvarez','BA History'),
('U2023188','Hiro Tanaka','BSc Mathematics'),
('U2025099','Grace Okonkwo','BSc Biology'),
('U2024450','Omar Haddad','BA Economics'),
('U2023315','Mei Lin','BA Design'),
('U2022477','Jonah Brooks','BSc Physics'),
('U2025140','Fatima Zahra','LLB Law'),
('U2024222','Lucas Moreau','BA Music');

INSERT INTO public.volunteers (id, name, categories, skills, experience_years, availability_days, availability_label, location, rating, sessions, bio) VALUES
('11111111-0000-0000-0000-000000000001','Maya Anand','{"Scribe assistance","Reader assistance","Exam assistance"}','{"Certified scribe","Screen reader literacy","Quiet-room protocol"}',4,'{"Mon","Tue","Wed","Thu","Fri"}','Weekday afternoons','Main Library',4.9,38,'Final-year English student, certified exam scribe.'),
('11111111-0000-0000-0000-000000000002','Diego Kim','{"Scribe assistance","Note-taking assistance"}','{"Fast typing (95 wpm)","STEM notation","LaTeX"}',2,'{"Mon","Tue","Wed","Thu","Fri"}','Mon–Fri PM','Science Wing',4.7,23,'Engineering student comfortable with equations and diagrams.'),
('11111111-0000-0000-0000-000000000003','Tara Singh','{"Scribe assistance","Reader assistance"}','{"Humanities","Patient pacing","Audio description"}',1,'{"Mon","Thu","Fri"}','Mon, Thu, Fri','Arts Building',4.5,11,'History student, calm and patient reader.'),
('11111111-0000-0000-0000-000000000004','Daniel Okafor','{"Mobility assistance","Communication assistance","Campus activity assistance"}','{"Wheelchair escort","BSL / ASL","First aid certified"}',4,'{"Mon","Tue","Wed"}','Mon–Wed all day','North Campus',4.8,58,'Sign language fluent, knows every step-free route on campus.'),
('11111111-0000-0000-0000-000000000005','Priya Venkat','{"Exam assistance","Scribe assistance"}','{"Timed scribing","Quiet room","Extra-time logistics"}',2,'{"Wed","Fri"}','Wed & Fri','Exam Hall B',4.9,33,'Scribed 22 timed exams with the accessibility office.'),
('11111111-0000-0000-0000-000000000006','Theo Halvorsen','{"Note-taking assistance","Reader assistance"}','{"Lecture capture","Structured notes","Mind maps"}',1,'{"Tue","Wed","Thu"}','Tue–Thu','Science Wing',4.6,19,'Writes clear, syllabus-aligned notes the same day.'),
('11111111-0000-0000-0000-000000000007','Amara Osei','{"Communication assistance","Campus activity assistance"}','{"Live captioning","Plain-language summaries","Event support"}',3,'{"Thu","Fri","Sat"}','Thu–Sat incl. evenings','Student Union',4.8,41,'Captions society events and lectures in real time.'),
('11111111-0000-0000-0000-000000000008','Ravi Menon','{"Mobility assistance","Campus activity assistance"}','{"Campus navigation","Lab assistance","Sighted guide"}',2,'{"Mon","Tue","Fri"}','Mon, Tue, Fri','Main Library',4.4,15,'Trained sighted guide, helps with lab sessions.'),
('11111111-0000-0000-0000-000000000009','Chloe Martin','{"Reader assistance","Exam assistance","Note-taking assistance"}','{"Clear diction","Multilingual (FR/EN)","Exam reading"}',3,'{"Mon","Wed","Thu"}','Mon, Wed, Thu','Arts Building',4.7,27,'Drama student with clear, steady reading voice.');

INSERT INTO public.support_requests (student_name, student_code, category, support_required, request_date, request_time, location, urgency, details, status, volunteer_id, created_at) VALUES
('Aisha Rahman','U2024118','Scribe assistance','Scribe for timed essay during midterms', CURRENT_DATE + 3,'14:00','Main Library','High','Needs quiet room; prefers scribe experienced with timed writing.','open',NULL, now() - interval '2 hours'),
('Dev Patel','U2023042','Mobility assistance','Escort between Science Wing and North Campus labs', CURRENT_DATE + 1,'09:30','North Campus','Medium','Uses a wheelchair; lift in Block C is out of service.','open',NULL, now() - interval '5 hours'),
('Lena Fischer','U2025007','Note-taking assistance','Notes for Cognitive Psychology lectures', CURRENT_DATE + 2,'11:00','Science Wing','Medium','Weekly lecture, 2 hours.','open',NULL, now() - interval '1 day'),
('Kofi Mensah','U2022210','Communication assistance','Live captions for group project meeting', CURRENT_DATE + 4,'16:00','Student Union','Low','Hard of hearing, prefers captions over interpreter.','open',NULL, now() - interval '1 day'),
('Sofia Alvarez','U2024361','Reader assistance','Reader for archive documents', CURRENT_DATE + 5,'13:00','Arts Building','Low','Low vision, handwritten sources.','open',NULL, now() - interval '2 days'),
('Hiro Tanaka','U2023188','Exam assistance','Scribe for maths final', CURRENT_DATE + 6,'10:00','Exam Hall B','High','Needs STEM notation support.','matched','11111111-0000-0000-0000-000000000002', now() - interval '2 days'),
('Grace Okonkwo','U2025099','Campus activity assistance','Support at Biology field-day', CURRENT_DATE + 7,'09:00','North Campus','Medium','Mobility support on uneven ground.','matched','11111111-0000-0000-0000-000000000004', now() - interval '3 days'),
('Omar Haddad','U2024450','Note-taking assistance','Notes for Econometrics', CURRENT_DATE + 1,'15:00','Science Wing','Medium','','accepted','11111111-0000-0000-0000-000000000002', now() - interval '3 days'),
('Mei Lin','U2023315','Communication assistance','Captioning for design critique', CURRENT_DATE + 2,'17:00','Student Union','Medium','','accepted','11111111-0000-0000-0000-000000000007', now() - interval '4 days'),
('Jonah Brooks','U2022477','Scribe assistance','Lab report scribe', CURRENT_DATE - 3,'10:00','Science Wing','Low','','completed','11111111-0000-0000-0000-000000000002', now() - interval '6 days'),
('Fatima Zahra','U2025140','Reader assistance','Reader for case law', CURRENT_DATE - 5,'12:00','Main Library','Medium','','completed','11111111-0000-0000-0000-000000000001', now() - interval '8 days'),
('Lucas Moreau','U2024222','Mobility assistance','Escort to concert hall rehearsal', CURRENT_DATE - 2,'18:00','Arts Building','Low','','completed','11111111-0000-0000-0000-000000000004', now() - interval '7 days'),
('Aisha Rahman','U2024118','Exam assistance','Reader for poetry exam', CURRENT_DATE - 8,'09:00','Exam Hall B','High','','completed','11111111-0000-0000-0000-000000000005', now() - interval '12 days'),
('Dev Patel','U2023042','Note-taking assistance','Algorithms lecture notes', CURRENT_DATE - 4,'14:00','Science Wing','Low','','completed','11111111-0000-0000-0000-000000000002', now() - interval '9 days');