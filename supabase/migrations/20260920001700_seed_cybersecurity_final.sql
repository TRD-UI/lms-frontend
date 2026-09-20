-- ─────────────────────────────────────────────────────────────────────────────
-- Data: the thirty-question Cybersecurity final paper.
--
-- Normally this would arrive via supabase/seed.sql, but `db push --include-seed`
-- skips a seed it has already applied — it only refreshes the stored hash. New
-- seed content therefore has to come in as its own migration.
--
-- Every statement is ON CONFLICT DO NOTHING against deterministic UUID v5 ids,
-- so this is safe to re-apply and matches exactly what the generator emits.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('4e09d118-38cb-5330-a540-f4fe75c676e0', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', null,
        'Cybersecurity Final Examination', 'The full end-of-course paper. Thirty questions across networking, cryptography, threats and secure design.', 'final'::public.assessment_kind, 'published'::public.assessment_status,
        70, 45, 2, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', '2026-03-01T09:00:00.000Z')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('1c195f11-d50f-5c4c-88df-83f7b1898a79', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which layer of the OSI model does TCP operate at?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('94138d5e-07ed-5767-9f00-2068cadbfdb1', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Network', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6e4b6b60-604e-5883-8cf0-ad7c849ce3e9', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Transport', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('0e2b965c-e8ac-5ce6-9d43-744f2045a42b', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Session', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a80105eb-6678-5bcd-a328-59ac61216779', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Data link', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('7bea3d47-d405-52af-91cb-4c92448f5af2', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is the default port for HTTPS?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('67cb6463-2903-5f54-987b-dfa04f6caf49', '7bea3d47-d405-52af-91cb-4c92448f5af2', '80', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('507c0539-6b22-53ca-9d06-301a123efd8d', '7bea3d47-d405-52af-91cb-4c92448f5af2', '443', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f74b1878-47aa-5022-a9c4-30899255b88a', '7bea3d47-d405-52af-91cb-4c92448f5af2', '8080', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dec17aac-ac13-5ee6-88b3-8f685714579e', '7bea3d47-d405-52af-91cb-4c92448f5af2', '22', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8a897560-ca83-51d0-941f-9a20ececd775', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which encryption standard is considered strongest here?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c184c4ea-cdea-5559-8ff5-b5a8ea91a1b2', '8a897560-ca83-51d0-941f-9a20ececd775', 'DES', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6bd280ad-110c-5a7d-aedc-a53409d49696', '8a897560-ca83-51d0-941f-9a20ececd775', '3DES', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ac91bc3d-25da-5fee-a998-10c193a1b8c1', '8a897560-ca83-51d0-941f-9a20ececd775', 'AES-256', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3cb0e93e-fcf8-53da-a79f-20869d271263', '8a897560-ca83-51d0-941f-9a20ececd775', 'RC4', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('cb0ce1ab-6579-5e84-b789-fb90fe63a9d2', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'A firewall''s primary purpose is to filter network traffic.', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 3)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c974ef85-19c7-5b08-8601-31cb9562c448', 'cb0ce1ab-6579-5e84-b789-fb90fe63a9d2', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3633e6d4-4eac-5a64-87c5-a60dafdd780b', 'cb0ce1ab-6579-5e84-b789-fb90fe63a9d2', 'False', false, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('071d4262-6086-5117-ac8e-afd03312813f', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does CIA stand for in security?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 4)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f2ed4b15-8937-5d31-9bdc-745d78fcd8a7', '071d4262-6086-5117-ac8e-afd03312813f', 'Confidentiality, Integrity, Availability', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ab4df572-feee-5945-8781-bef6c5641a30', '071d4262-6086-5117-ac8e-afd03312813f', 'Control, Identity, Access', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ed245c0e-37e9-513f-b63d-6d6eecf1d5d1', '071d4262-6086-5117-ac8e-afd03312813f', 'Cipher, Integrity, Audit', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('60a983c9-8f06-529c-8d25-6357ce0a8abe', '071d4262-6086-5117-ac8e-afd03312813f', 'Confidentiality, Identity, Authorisation', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('ec881bd6-2bb9-5ab0-866f-98a054a5ca32', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which of these is a symmetric cipher?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 5)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c2b68d99-3509-55ea-96b7-3ea67147e109', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'RSA', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1a221bcf-202a-5eff-b553-5db9535008ed', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'AES', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e619672d-7d37-58f1-b296-e709c8d76b32', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'ECDSA', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7318ea24-c960-5645-8576-1c60323b2f88', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'Diffie-Hellman', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('567721ac-87cd-5254-b6d7-d308bbd9d65d', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Phishing primarily exploits which weakness?', 'single'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 6)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dc14b44b-c8b8-5e6e-80f0-a7f3f027d0be', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Buffer overflows', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2746f207-0f6b-5683-afa3-0bdd3a6a5f8b', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Human judgement', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9ef497d3-5d91-54de-a536-016e77bf1d94', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Weak ciphers', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1c9f3870-e073-5a87-a0fe-a1fa0b13ddf3', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Open ports', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('4b522e1c-3c19-52ea-9d57-a52990306e48', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does a salt protect against?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 7)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('022f1485-c04f-5c5b-93f2-aedc6e3ff6a9', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'Brute force', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('50b07253-aa40-5238-a746-2cd8d965a8ee', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'Rainbow tables', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7c3858fa-9359-5415-83e6-f42fb11a9b71', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'Packet sniffing', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('78b9be86-cff5-5b36-b27e-727232b759a2', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'SQL injection', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which HTTP header enforces transport security?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 8)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c5f2a504-d27c-5f21-bc72-2688591fb6e2', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'X-Frame-Options', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5a0d1846-2e31-5bc4-b424-31f0c5d686c7', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'Strict-Transport-Security', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9e91ca4c-9836-5567-aa2e-d2c953ce3aa6', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'Content-Type', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d5d2d250-c3f5-5368-b89c-0f2b0f946309', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'Accept-Encoding', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('0ae55f19-0f2c-579c-875b-a6d56866cf89', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Select every valid authentication factor.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 9)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('95ca86c4-f209-538a-a58a-56d61a5c1645', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you know', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('cb40eccf-2a27-529f-8515-cd889e4b8682', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you have', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('af04ce42-ceb8-5b7c-8076-2b9fdfbf5a72', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you are', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('81ae3b2a-1634-5749-b6fe-fb5ee7fabb50', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you want', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8fd8c787-cf80-5e7a-a9ca-34338960f875', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is privilege escalation?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 10)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8b0c8dd4-2d8d-5682-8828-1dd249e9cb98', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Gaining higher access than granted', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a62550fe-92ef-508f-b7c4-9a1ed55c033c', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Resetting a password', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('533beadc-ca1a-505b-9e16-7381bf01149b', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Encrypting a disk', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1acb4685-8d1d-5171-8ef5-10c54c2a357a', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Rotating a key', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('24dd9777-53a7-5a97-b8e9-bc34900b660b', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'A VPN guarantees anonymity from all parties.', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 11)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('70ee0737-b189-5b63-9677-4709a515604f', '24dd9777-53a7-5a97-b8e9-bc34900b660b', 'True', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4024f422-ce18-5947-acad-77f60a79559e', '24dd9777-53a7-5a97-b8e9-bc34900b660b', 'False', true, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('019c5038-f5dc-543d-a0c6-5b8059786322', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which tool captures network packets?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 12)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('71ae7f0f-fde0-5a16-830c-4a95785d6f50', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Wireshark', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f9de67a0-dfb8-5f27-8640-885fb506a4e9', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Photoshop', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2afdabd6-4bd5-5878-a9fb-433ebc64cca4', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Postman', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('45fb23e2-ca10-5e25-93df-8a1e93c7eeac', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Figma', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('69caf08e-d1f7-5a1d-a104-49f63ddcf728', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does SQL injection target?', 'single'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 13)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('73d25d31-c5e0-5472-aa22-ce9b70b0d05d', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The database query layer', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fab7c776-8625-5b15-bd6f-5af74678a441', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The CSS renderer', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7cef3079-5890-518c-9402-7b8bab308fc5', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The DNS resolver', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9e6b7691-2707-534f-a3d4-ff614686c72b', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The file system', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('5fc2a9bc-d758-542b-ba25-1b916c2088c8', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which is a denial-of-service indicator?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 14)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('173d0ce9-6e49-5919-bbef-e21fb4030b6f', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Sudden traffic flood', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4b9215f8-1f8f-5880-bb6a-071729cd242e', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Slow typing', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ea29f5b2-f225-57e6-8043-dacf84267a56', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Low disk space', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8ecaa67e-a2f1-5331-9264-e350dd5eee5a', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Expired cookie', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('cf77c383-229a-5eb8-9bca-d656833e3d58', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is the purpose of a WAF?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 15)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5de76070-917c-5063-b78f-8db79bbe3e25', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Filter web application traffic', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('025430b1-79d4-55d5-a3db-4c1fd39d02ff', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Compress images', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('58264069-b7bc-5d38-85c0-017e6d6f03a3', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Cache DNS', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4c9320d0-d150-5741-9d53-59944dc90f3d', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Balance CPU load', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('9b333225-6f7f-5d19-b881-4281eacaf2a2', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Two-factor authentication requires two of the same factor type.', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 16)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('52d460a8-8c6b-51dc-aa8a-5914c708c73e', '9b333225-6f7f-5d19-b881-4281eacaf2a2', 'True', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1f20e2bd-9bd2-5b41-871a-86a3a0c6d512', '9b333225-6f7f-5d19-b881-4281eacaf2a2', 'False', true, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('6b6dd721-2715-51b1-baa5-9e65694711ec', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which describes a zero-day?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 17)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('27f2e7de-049f-59b1-b87f-32c36d8b63ae', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'A patched bug', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('cce95c65-9d82-581f-a9ed-e507ad1511ce', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'A vulnerability with no patch yet', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d3c6a54f-58fe-5897-891e-1bfa8b19671e', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'An expired certificate', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('007e124d-5cc0-5a26-94d3-6fa9c8985ebe', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'A retired protocol', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('3d04c226-97fc-5876-a2e8-b4888932f663', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does hashing provide?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 18)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('407fa2c8-fe31-5f82-8fbb-101e003b11b6', '3d04c226-97fc-5876-a2e8-b4888932f663', 'Reversible transformation', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('08efc02e-7a3c-5288-9837-aef280dbe68c', '3d04c226-97fc-5876-a2e8-b4888932f663', 'One-way fingerprint', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8778b360-3283-5d1c-8935-3248b6baae66', '3d04c226-97fc-5876-a2e8-b4888932f663', 'Compression', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d13b5f67-a109-5eaf-a31b-644fe3093c9f', '3d04c226-97fc-5876-a2e8-b4888932f663', 'Encoding', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('b50af431-1f00-5fa3-9008-5d4e6a63950b', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Select every common malware category.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 19)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('abe40869-2d98-532b-a64c-ec5cb108c66f', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Ransomware', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('df839cbd-449d-519a-bb13-ac44106d84f9', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Spyware', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('556174fe-12ae-586f-8720-845430af9438', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Worm', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9b0046cd-c6f0-509a-b6d1-012afd44213d', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Firewall', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which protocol secures email in transit?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 20)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c6986df0-51a0-5503-8932-bbbfceb47fd7', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'SMTP', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('02c01d0c-235d-5d60-808d-738c360d9eac', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'STARTTLS', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7070af57-40da-5189-85f7-46d64bff9387', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'POP3', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('146d0780-f499-57e1-823c-91400ca148b8', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'IMAP', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('97191cbf-d4ee-59ba-940d-80f07fc3be39', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is lateral movement?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 21)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d787bc4e-9661-58b7-8a9b-91bcf5eea801', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Spreading across systems post-compromise', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('60592ce2-4456-5b08-adeb-9fe5960a4d04', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Rebooting a server', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c60a1086-85ee-5b87-a75f-a959df5b8608', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Rotating logs', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1ea0056c-5c93-5c55-a017-83428bcd26c6', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Scaling horizontally', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('94fd5c20-af5c-5b29-9e52-ad04ef5efd43', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'A certificate authority''s role is to vouch for identity.', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 22)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c6f9da44-5fc2-5e74-8db0-1441328ebef0', '94fd5c20-af5c-5b29-9e52-ad04ef5efd43', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fb561482-ba6d-5b1c-8147-e0f1011eb710', '94fd5c20-af5c-5b29-9e52-ad04ef5efd43', 'False', false, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('71145b1f-6ef8-53a4-a05b-43704e023968', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which is a secure password practice?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 23)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('73c40f72-2a62-5300-a272-eb1a54cfce71', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Reuse across sites', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('69498c6a-3424-5459-a732-817db763bf74', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Long unique passphrases', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4ec14b2b-e136-5f50-aaeb-2f929b93c10e', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Write on a sticky note', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5d366039-b2ec-5352-893e-fa80c966ea44', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Share with the team', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does IDS stand for?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 24)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f4edb3d4-ec94-5bdd-af9d-bd4e95220aaf', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Intrusion Detection System', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ad6fd393-c7f4-56a0-a2cb-d3cbf8578656', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Internal Data Store', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b5bc3726-33a5-5227-ac76-06235857e29f', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Identity Directory Service', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('57e40dc3-2a95-52c2-b3bb-dd6897874bd5', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Integrated Defence Suite', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('833ec969-a94a-521d-b69d-368cbd09d44b', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which reduces the blast radius of a breach?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 25)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dd8ca1aa-9b9d-5bf8-b491-9397ffd03693', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Flat networks', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('13747acd-8b2f-57a1-9443-a0c7321edb21', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Network segmentation', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d3971051-31bd-5c0f-971c-2345c4199e2c', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Shared credentials', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('39f04239-cec2-5e16-92e1-7e568fec2f84', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Disabled logging', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is social engineering?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 26)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('10db67c1-2bee-5590-a52f-20532048f041', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Manipulating people to gain access', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e667b992-f886-5846-b148-e9b8c2f47703', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Refactoring code', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bb49fa80-fdce-55ca-8124-65014de6b4fb', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Tuning a database', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fb44552a-db68-5e7f-b8b4-8780e2c9d096', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Designing a network', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('e0b01665-216a-5671-927b-ddf008639f55', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Select every principle of secure design.', 'multiple'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 27)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6c95b2e7-c8ab-55eb-8d0b-85bb3dbbc284', 'e0b01665-216a-5671-927b-ddf008639f55', 'Least privilege', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('38079f5a-0fc4-5492-a841-826f5a42d9f5', 'e0b01665-216a-5671-927b-ddf008639f55', 'Defence in depth', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8fddbf36-4f9b-53e4-ad1f-b402c58363d0', 'e0b01665-216a-5671-927b-ddf008639f55', 'Fail securely', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1a81d63e-02b7-53d9-bcde-3869a03d932d', 'e0b01665-216a-5671-927b-ddf008639f55', 'Security through obscurity', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('a0eb6cd2-f845-56de-ae7e-5457832a94fb', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which log is most useful after a breach?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 28)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e3168836-ee71-5bf7-9eca-ba3f7c8e5495', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Audit trail', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b0be5256-4692-55c8-9849-e657e6dd0fdb', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Marketing analytics', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d254e832-33ea-5f86-ad05-195226cde5ea', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Build log', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6faf98d0-4106-576e-8e81-c54ce6e10966', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Changelog', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('5d012451-1f63-5052-a62c-3427d073ff98', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Patching is a preventive control.', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 29)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f68425ee-4a5b-57d9-8a98-c380a6eac9e8', '5d012451-1f63-5052-a62c-3427d073ff98', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a7d9ba20-dc97-5427-b1e7-1514eb797cee', '5d012451-1f63-5052-a62c-3427d073ff98', 'False', false, 1) on conflict (id) do nothing;